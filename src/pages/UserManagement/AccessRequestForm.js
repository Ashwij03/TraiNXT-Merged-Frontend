import { useState } from "react";

function AccessRequestForm() {

  const [selected,
    setSelected] = useState([]);

  const permissions = [

    "study.view",

    "subject.view",

    "subject.edit",

    "visit.view",

    "visit.edit",

    "report.view"
  ];

  const handleChange = (
    permission
  ) => {

    if (
      selected.includes(permission)
    ) {

      setSelected(
        selected.filter(
          p => p !== permission
        )
      );

    } else {

      setSelected([
        ...selected,
        permission
      ]);
    }
  };

  const submitRequest = () => {

    localStorage.setItem(
      "requestedPermissions",
      JSON.stringify(selected)
    );

    alert(
      "Access Request Submitted"
    );
  };

  return (
    <div>

      <h2>
        Access Request Form
      </h2>

      {permissions.map(permission => (

        <div key={permission}>

          <input
            type="checkbox"
            onChange={() =>
              handleChange(
                permission
              )
            }
          />

          {permission}

        </div>

      ))}

      <button
        onClick={submitRequest}
      >
        Submit
      </button>

    </div>
  );
}

export default AccessRequestForm;