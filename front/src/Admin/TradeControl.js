import React, { useEffect, useState } from "react";
import axios from "axios";

const TradeControl = () => {
  const [clients, setClients] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [defaultControl, setDefaultControl] = useState(false);
  const [defaultTradeResult, setDefaultTradeResult] = useState(null);
  const [defaultControlMessage, setDefaultControlMessage] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get("https://trcnfx.com/api/clients");
        setClients(response.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  const fetchPredictions = async (userId) => {
    try {
      const waitingResponse = await axios.get(
        `https://trcnfx.com/api/predictions/waiting?userId=${userId}`
      );
      const allResponse = await axios.get(
        `https://trcnfx.com/api/predictions/user/${userId}`
      );

      const waitingPredictions = waitingResponse.data.map((prediction) => ({
        ...prediction,
        isLive: true,
      }));

      setPredictions(
        [...waitingPredictions, ...allResponse.data].sort(
          (a, b) => new Date(b.predictedAt) - new Date(a.predictedAt)
        )
      );
      setSelectedUserId(userId);

      // Fetch the default trade result
      const defaultResultResponse = await axios.get(
        `https://trcnfx.com/api/users/${userId}/default-trade-result`
      );
      setDefaultTradeResult(defaultResultResponse.data.defaultTradeResult);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    }
  };

  const handleResult = async (id, result) => {
    try {
      await axios.post(
        `https://trcnfx.com/api/prediction/${id}/result`,
        result
      );
      setPredictions((prevPredictions) =>
        prevPredictions.filter((prediction) => prediction._id !== id)
      );
    } catch (error) {
      console.error("Error updating prediction result:", error);
    }
  };

  const handleConfirmAction = (action, prediction) => {
    setConfirmAction(action);
    setSelectedPrediction(prediction);
  };

  const handleCancelAction = () => {
    setConfirmAction(null);
    setSelectedPrediction(null);
  };

  const handleConfirmResult = () => {
    if (selectedPrediction && confirmAction) {
      handleResult(selectedPrediction._id, confirmAction);
    }
    setConfirmAction(null);
    setSelectedPrediction(null);
  };

  const handleDefaultControl = async (result) => {
    try {
      await axios.post(
        `https://trcnfx.com/api/users/${selectedUserId}/default-trade-result`,
        { defaultTradeResult: result }
      );
      setDefaultControl(false);
      setDefaultControlMessage("");
      setDefaultTradeResult(result);
      fetchPredictions(selectedUserId);
    } catch (error) {
      console.error("Error updating default trade result:", error);
    }
  };

  return (
    <div className="admin-trade-control p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Trade Control</h2>
      {selectedUserId ? (
        <div className="overflow-x-auto">
          <div className="mb-4">
            <button
              className="bg-gray-500 text-white py-1 px-3 rounded"
              onClick={() => setDefaultControl(true)}
            >
              Set Default Control
            </button>
            {defaultTradeResult && (
              <span className="ml-4">
                Current default control:{" "}
                <strong style={{ color: "black" }}>
                  {defaultTradeResult.toUpperCase()}
                </strong>
              </span>
            )}
          </div>
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">User ID</th>
                <th className="py-3 px-6 text-left">Coin</th>
                <th className="py-3 px-6 text-left">Date and Time</th>
                <th className="py-3 px-6 text-left">Trade Direction</th>
                <th className="py-3 px-6 text-left">Trade Amount</th>
                <th className="py-3 px-6 text-left">Delivery Time</th>
                <th className="py-3 px-6 text-left">Profit</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {predictions.map((prediction) => (
                <tr
                  key={prediction._id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {prediction.uid}
                  </td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {prediction.symbol.toUpperCase()}/USDT
                  </td>
                  <td className="py-3 px-6 text-left">
                    {new Date(prediction.predictedAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {prediction.direction}
                  </td>
                  <td className="py-3 px-6 text-left">{prediction.amount}</td>
                  <td className="py-3 px-6 text-left">
                    {prediction.deliveryTime}
                  </td>
                  <td className="py-3 px-6 text-left">
                    $ {prediction.result.profit}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {prediction.isLive ? (
                      <>
                        <button
                          className="bg-green-500 text-white py-1 px-3 rounded mr-2"
                          onClick={() =>
                            handleConfirmAction(
                              {
                                success: true,
                                amount: prediction.amount,
                                message: "Admin approved profit",
                              },
                              prediction
                            )
                          }
                        >
                          Win
                        </button>
                        <button
                          className="bg-red-500 text-white py-1 px-3 rounded mr-2"
                          onClick={() =>
                            handleConfirmAction(
                              {
                                success: false,
                                amount: prediction.amount,
                                message: "Admin approved loss",
                              },
                              prediction
                            )
                          }
                        >
                          Loss
                        </button>
                        <button
                          className="bg-gray-500 text-white py-1 px-3 rounded"
                          onClick={() =>
                            handleConfirmAction({ success: null }, prediction)
                          }
                        >
                          Default
                        </button>
                      </>
                    ) : (
                      <span className="text-green-500">&#x25cf;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="mt-4 bg-gray-500 text-white py-1 px-3 rounded"
            onClick={() => setSelectedUserId(null)}
          >
            Back to Users
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Agent ID</th>

                <th className="py-3 px-6 text-left">User ID</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {clients.map((client) => (
                <tr
                  key={client._id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left">{client.agentUID}</td>

                  <td className="py-3 px-6 text-left">{client.userId}</td>
                  <td className="py-3 px-6 text-left">{client.email}</td>
                  <td className="py-3 px-6 text-left">
                    <button
                      className="bg-blue-500 text-white py-1 px-3 rounded"
                      onClick={() => fetchPredictions(client._id)}
                    >
                      Trade Control
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmAction && selectedPrediction && (
        <Modal
          show={true}
          onClose={handleCancelAction}
          onConfirm={handleConfirmResult}
          message={`Are you sure you want to ${
            confirmAction.success === true
              ? "win"
              : confirmAction.success === false
              ? "lose"
              : "keep the default"
          } this trade?`}
        />
      )}

      {defaultControl && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl mb-4">Set Default Control</h3>
            <p>Set default control to win or loss for user?</p>
            <div className="flex justify-end mt-4">
              <button
                className="bg-green-500 text-white py-1 px-3 rounded mr-2"
                onClick={() => setDefaultControlMessage("win")}
              >
                Win
              </button>
              <button
                className="bg-red-500 text-white py-1 px-3 rounded"
                onClick={() => setDefaultControlMessage("loss")}
              >
                Loss
              </button>
              <button
                className="ml-2 bg-gray-500 text-white py-1 px-3 rounded"
                onClick={() => setDefaultControl(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {defaultControlMessage && (
        <Modal
          show={true}
          onClose={() => setDefaultControlMessage("")}
          onConfirm={() => handleDefaultControl(defaultControlMessage)}
          message={`Are you sure you want to set default value as ${defaultControlMessage}?`}
        />
      )}
    </div>
  );
};

const Modal = ({ show, onClose, onConfirm, message, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl mb-4">{message}</h3>
        <div className="flex justify-end">
          {children}
          <button
            className="bg-blue-500 text-white py-1 px-3 rounded mr-2"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="bg-gray-500 text-white py-1 px-3 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeControl;
