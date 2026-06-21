
// newly added

import React from "react";

import "./AlertsPanel.css";

function AlertsPanel({
  title = "Alerts",
  alerts = [],
}) {

  return (

    <div className="alerts-card">

      <div className="alerts-header">

        <h3>{title}</h3>

      </div>

      <div className="alerts-body">

        {alerts.length > 0 ? (

          alerts.map(
            (
              alert,
              index
            ) => (

              <div
                key={index}
                className={`alert-item ${alert.type}`}
              >

                <div className="alert-icon">

                  {alert.type === "danger" && "🚨"}

                  {alert.type === "warning" && (
                    <span className="alert-dot alert-dot--warning" aria-hidden="true" />
                  )}

                  {alert.type === "success" && "✅"}

                  {alert.type === "info" && "ℹ️"}

                </div>

                <div className="alert-content">

                  <div className="alert-title">

                    {alert.title}

                  </div>

                  <div className="alert-message">

                    {alert.message}

                  </div>

                </div>

              </div>

            )
          )

        ) : (

          <div className="no-alerts">

            No alerts available

          </div>

        )}

      </div>

    </div>

  );
}

export default AlertsPanel;