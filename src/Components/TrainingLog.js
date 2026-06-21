import React from "react";
import "./TrainingLog.css";

const TrainingLog = () => {

  return (

    <div className="training-container">

      <p className="entry-text">
        Showing 1 to 2 of 2 entries
      </p>

      {/* TOP BAR */}

      <div className="table-top">

        <div className="left-top">

          Show

          <select>
            <option>25</option>
          </select>

          entries

        </div>

        <div className="right-top">

          Search:

          <input type="text" />

        </div>

      </div>

      {/* TABLE */}

      <table className="training-table">

        <thead>

          <tr>
            <th>Training</th>
            <th>Linked Duties</th>
            <th>Delegates</th>
          </tr>

        </thead>

        <tbody>

          <tr>

            <td className="blue-link">
              GCP
            </td>

            <td>
              REQUIRED FOR ALL USERS
            </td>

            <td>

              <div className="delegate-icons">

                {/* FIRST USER WITH TOOLTIP */}

                <div className="delegate-wrapper">

                  <div className="delegate-avatar">

                    <img
                      src="https://api.dicebear.com/7.x/adventurer/svg?seed=Hannah"
                      alt=""
                    />

                    <span className="warning">▲</span>

                  </div>

                  <div className="delegate-tooltip">

                    <h4>Hannah Kulkarni</h4>

                    <p>Coordinator</p>

                    <span>
                      GCP training certification
                    </span>

                  </div>

                </div>

                {/* OTHER USERS */}

                <div className="delegate-avatar">
                  <img
                    src="https://api.dicebear.com/7.x/adventurer/svg?seed=Megan"
                    alt=""
                  />
                  <span className="warning">!</span>
                </div>

                <div className="delegate-avatar">
                  <img
                    src="https://api.dicebear.com/7.x/adventurer/svg?seed=Chris"
                    alt=""
                  />
                  <span className="warning">!</span>
                </div>

                <div className="delegate-avatar">
                  <img
                    src="https://api.dicebear.com/7.x/adventurer/svg?seed=David"
                    alt=""
                  />
                 <span className="warning">!</span>
                </div>

                <div className="delegate-avatar">
                  <img
                    src="https://api.dicebear.com/7.x/adventurer/svg?seed=Sara"
                    alt=""
                  />
                </div>

                <div className="delegate-avatar">
                  <img
                    src="https://api.dicebear.com/7.x/adventurer/svg?seed=John"
                    alt=""
                  />
                  <span className="warning">!</span>
                </div>

                <div className="delegate-avatar">
                  <img
                    src="https://api.dicebear.com/7.x/adventurer/svg?seed=Alex"
                    alt=""
                  />
                </div>

                <div className="delegate-avatar">
                  <img
                    src="https://api.dicebear.com/7.x/adventurer/svg?seed=Emma"
                    alt=""
                  />
                </div>

              </div>

            </td>

          </tr>

        </tbody>

      </table>

    </div>

  );

};

export default TrainingLog;