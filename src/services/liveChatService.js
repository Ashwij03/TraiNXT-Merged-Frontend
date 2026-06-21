import ROLES from "../constants/roles";
import { getEffectiveRole } from "./roleService";

const STORAGE_KEYS = {
  [ROLES.ADMIN]: "adminLiveChatData",
  [ROLES.SITE_STAFF]: "siteStaffLiveChatData",
  [ROLES.CRO]: "croLiveChatData",
  [ROLES.SPONSOR]: "sponsorLiveChatData",
  [ROLES.PI]: "piLiveChatData",
};

const DEFAULT_CONVERSATIONS = [
  {
    id: 1,
    name: "Site Coordinator",
    unread: 2,
    messages: [
      { sender: "them", text: "Need help with Subject 101", time: "10:24 AM" },
      { sender: "me", text: "Sure, what is the issue?", time: "10:25 AM" },
    ],
  },
  {
    id: 2,
    name: "Clinical Monitor",
    unread: 1,
    messages: [{ sender: "them", text: "Visit completed successfully", time: "11:00 AM" }],
  },
  {
    id: 3,
    name: "Data Manager",
    unread: 0,
    messages: [{ sender: "them", text: "Database lock scheduled", time: "9:15 AM" }],
  },
];

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return { conversations: DEFAULT_CONVERSATIONS };
    }
    const parsed = JSON.parse(raw);
    return parsed?.conversations?.length
      ? parsed
      : { conversations: DEFAULT_CONVERSATIONS };
  } catch {
    return { conversations: DEFAULT_CONVERSATIONS };
  }
}

function writeStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}

export function getLiveChatStorageKey(role = getEffectiveRole()) {
  return STORAGE_KEYS[role] || STORAGE_KEYS[ROLES.ADMIN];
}

export function getRoleLiveChatData(role = getEffectiveRole()) {
  return readStorage(getLiveChatStorageKey(role));
}

export function saveRoleLiveChatData(data, role = getEffectiveRole()) {
  return writeStorage(getLiveChatStorageKey(role), data);
}
