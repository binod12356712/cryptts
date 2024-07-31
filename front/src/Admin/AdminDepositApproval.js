import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import "./AdminPanel.css";
import "../wallet/WalletDashboard.css"; // Import the CSS file for styling

const AdminDepositApproval = () => {
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentDeposit, setCurrentDeposit] = useState(null);

  useEffect(() => {
    const fetchPendingDeposits = async () => {
      try {
        const response = await axios.get("https://trcnfx.com/api/deposits");
        setPendingDeposits(response.data);
      } catch (error) {
        console.error("Error fetching pending deposits:", error);
      }
    };

    fetchPendingDeposits();
  }, []);

  const handleApprove = async (id, updatedAmount) => {
    try {
      await axios.post(`https://trcnfx.com/api/deposits/${id}/approve`, {
        amount: updatedAmount,
      });
      alert("Deposit approved successfully");
      setPendingDeposits(
        pendingDeposits.filter((deposit) => deposit._id !== id)
      );
    } catch (error) {
      console.error("Error approving deposit:", error);
      alert("Failed to approve deposit");
    }
  };

  const handleActionClick = (deposit) => {
    setCurrentDeposit(deposit);
    setShowModal(true);
  };

  const handleConfirmAction = () => {
    handleApprove(currentDeposit._id, currentDeposit.amount);
    setShowModal(false);
  };

  const handleCancelAction = () => {
    setShowModal(false);
  };
  const handleAmountChange = (e) => {
    setCurrentDeposit({
      ...currentDeposit,
      amount: parseFloat(e.target.value),
    });
  };

  return (
    <div className="admin-panel">
      <h2>
        <b style={{ color: "black", fontSize: "18px" }}>Recharge Requests</b>
      </h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Agent ID</th>
            <th>User ID</th>
            <th>Amount</th>
            <th>Coin</th>
            <th>Proof</th>
            <th>Date and Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingDeposits.map((deposit) => (
            <tr key={deposit._id}>
              <td>{deposit.userId.agentUID}</td>
              <td>{deposit.uid}</td>
              <td>
                {deposit.amount} {deposit.selectedSymbol}
              </td>
              <td>{deposit.selectedSymbol.toUpperCase()}</td>
              <td>
                <a
                  href={deposit.proof}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Proof
                </a>
              </td>
              <td>{format(new Date(deposit.createdAt), "PPpp")}</td>
              <td>
                <button
                  style={{ border: "1px solid #000" }}
                  onClick={() => handleActionClick(deposit)}
                >
                  Approve
                </button>
                <button
                  style={{ border: "1px solid #000" }}
                  onClick={() => handleActionClick(deposit._id)}
                >
                  Decline
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{currentDeposit.selectedSymbol.toUpperCase()} Recharge</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmAction();
              }}
            >
              <div className="form-group">
                <label>Currency</label>
                <input
                  type="text"
                  value={currentDeposit.selectedSymbol.toUpperCase()}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="number"
                  value={currentDeposit.amount}
                  onChange={handleAmountChange}
                  required
                />
              </div>
              <button type="submit" className="submit-button">
                Approve
              </button>
              <button type="button" onClick={handleCancelAction}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepositApproval;
