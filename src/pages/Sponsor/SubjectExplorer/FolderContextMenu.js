import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MdMoreVert,
  MdAdd,
  MdCreateNewFolder,
  MdFolderSpecial,
  MdDriveFileRenameOutline,
  MdDeleteOutline,
  MdEdit,
} from "react-icons/md";

/**
 * Subject Explorer - folder three-dot context menu (Phase 3).
 *
 * Presentational: it only reports the chosen action upward; the explorer
 * owns the tree and opens the matching modal.
 *
 * Actions
 *   create-folder    -> new folder as a SIBLING of this node
 *                       (for a subject row: a new folder INSIDE the subject)
 *   create-subfolder -> new folder INSIDE this folder (unlimited nesting)
 *   rename           -> rename this folder (or, on a subject row, edit the
 *                       subject - SubjectExplorer routes by node.type)
 *   delete           -> delete this folder and its children (or, on a
 *                       subject row, delete the subject and its folders)
 *
 * Update 6 (Subject CRUD): subject rows now also expose "Edit Subject" and
 * "Delete Subject", reusing the same `rename` / `delete` action keys the
 * folder menu already sends - SubjectExplorer looks at `node.type` to
 * decide whether that opens the folder dialog or the subject dialog, so
 * this menu stays a thin, presentational reporter of intent. Only the
 * item labels/icons differ here between a subject and a folder row.
 *
 * The dropdown is rendered through a portal with fixed positioning so the
 * sidebar's `overflow: auto` cannot clip it.
 *
 * Phase 11 - eISF "+" interaction pattern:
 * Subject rows also get a small, ALWAYS-VISIBLE "+" button next to the
 * "..." trigger (unlike the trigger, it is never opacity-hidden behind
 * hover/focus). It fires the exact same `create-folder` action as the
 * dropdown's own "Create Folder" item - it is purely an additional, more
 * discoverable entry point, so the dropdown keeps working unchanged.
 *
 * This directly fixes the SUB-003 case: a subject with zero folders has no
 * caret and, before this change, its only "add a folder" affordance was a
 * three-dot trigger that stays invisible until the row is hovered/focused -
 * easy to miss on an otherwise-empty row. The persistent "+" removes that
 * gap for every subject, empty or not.
 */

const MENU_WIDTH = 194;
const MENU_MARGIN = 8;

function FolderContextMenu({ node, onAction, onOpenChange }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const isSubject = node?.type === "subject";

  /* Phase 11: quick "+" action - subjects only, creates a folder inside
     the subject in one click (same key/target as the menu's own item). */
  const handleQuickCreate = useCallback(
    (event) => {
      event.preventDefault();
      // Keep the row's click handler from firing (which would otherwise
      // toggle/select the node underneath the button).
      event.stopPropagation();
      if (typeof onAction === "function") onAction("create-folder", node);
    },
    [onAction, node]
  );

  const items = isSubject
    ? [
        {
          key: "create-folder",
          label: "Create Folder",
          Icon: MdCreateNewFolder,
        },
        {
          key: "rename",
          label: "Edit Subject",
          Icon: MdEdit,
        },
        {
          key: "delete",
          label: "Delete Subject",
          Icon: MdDeleteOutline,
          danger: true,
        },
      ]
    : [
        {
          key: "create-folder",
          label: "Create Folder",
          Icon: MdCreateNewFolder,
          hint: "Same level",
        },
        {
          key: "create-subfolder",
          label: "Create Subfolder",
          Icon: MdFolderSpecial,
          hint: "Inside",
        },
        {
          key: "rename",
          label: "Rename",
          Icon: MdDriveFileRenameOutline,
        },
        {
          key: "delete",
          label: "Delete",
          Icon: MdDeleteOutline,
          danger: true,
        },
      ];

  const closeMenu = useCallback(() => setOpen(false), []);

  /**
   * Anchor the menu under the trigger, flipping/clamping it so it always
   * stays inside the viewport.
   *
   * Scrolling repositions instead of closing: focusing the trigger can make
   * the scrollable tree shift by a few pixels, and closing on that would
   * dismiss the menu the instant it opened.
   */
  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current?.getBoundingClientRect();
    if (!trigger) return;

    const menuHeight = menuRef.current?.offsetHeight ?? 0;

    let top = trigger.bottom + 4;
    if (menuHeight && top + menuHeight > window.innerHeight - MENU_MARGIN) {
      top = Math.max(MENU_MARGIN, trigger.top - menuHeight - 4);
    }

    const left = Math.min(
      Math.max(MENU_MARGIN, trigger.right - MENU_WIDTH),
      window.innerWidth - MENU_WIDTH - MENU_MARGIN
    );

    setPosition({ top, left });
  }, []);

  /* Report open state so the row can stay visually active. */
  useEffect(() => {
    if (typeof onOpenChange === "function") onOpenChange(open);
  }, [open, onOpenChange]);

  /* Outside click / Escape dismissal; scroll+resize repositioning. */
  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (
        menuRef.current?.contains(event.target) ||
        triggerRef.current?.contains(event.target)
      ) {
        return;
      }
      closeMenu();
    };

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      event.stopPropagation();
      closeMenu();

      // Return focus to the trigger only if focus is still inside the menu;
      // otherwise a dialog opened from this menu would lose its own focus.
      if (menuRef.current?.contains(document.activeElement)) {
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    // `true` = capture, so scrolling the tree container is caught too.
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, closeMenu, updatePosition]);

  /* Measure once mounted so the flip uses the real menu height. */
  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  const handleTriggerClick = (event) => {
    // Stop the row's click handler so opening the menu never
    // toggles/selects the node underneath.
    event.preventDefault();
    event.stopPropagation();
    setOpen((prev) => !prev);
  };

  const runAction = (event, actionKey) => {
    event.preventDefault();
    event.stopPropagation();
    closeMenu();
    if (typeof onAction === "function") onAction(actionKey, node);
  };

  return (
    <>
      {isSubject && (
        <button
          type="button"
          className="sx-quick-add"
          aria-label={`Create folder in ${node?.name || "subject"}`}
          title="Create Folder"
          onClick={handleQuickCreate}
        >
          <MdAdd size={16} />
        </button>
      )}

      <button
        type="button"
        ref={triggerRef}
        className={`sx-menu-trigger${open ? " is-open" : ""}`}
        aria-label={`Folder actions for ${node?.name || "folder"}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={handleTriggerClick}
        onKeyDown={(event) => {
          // Escape must still close the menu, so handle it here rather than
          // relying on the document listener: React's stopPropagation below
          // would otherwise prevent the event from ever reaching it.
          if (event.key === "Escape") {
            if (open) {
              event.stopPropagation();
              closeMenu();
            }
            return;
          }
          // Keep the row's Enter/Space/Arrow handling from firing while the
          // trigger itself is focused.
          event.stopPropagation();
        }}
      >
        <MdMoreVert size={15} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="sx-menu"
            role="menu"
            aria-label={`Folder actions for ${node?.name || "folder"}`}
            style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sx-menu-heading" title={node?.name}>
              {node?.name}
            </div>

            {items.map(({ key, label, Icon, hint, danger }) => (
              <button
                key={key}
                type="button"
                role="menuitem"
                className={`sx-menu-item${danger ? " is-danger" : ""}`}
                onClick={(event) => runAction(event, key)}
              >
                <Icon size={15} aria-hidden="true" />
                <span className="sx-menu-item-label">{label}</span>
                {hint && <span className="sx-menu-item-hint">{hint}</span>}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

export default FolderContextMenu;
