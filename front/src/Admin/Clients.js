// Clients.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./Modal"; // Import the Modal component
import KycModal from "./KycModal"; // Import the KycModal component

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycDetails, setKycDetails] = useState(null);

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

  const handleDelete = async () => {
    try {
      await axios.delete(`https://trcnfx.com/api/clients/${selectedClientId}`);
      setClients(clients.filter((client) => client._id !== selectedClientId));
      setShowModal(false);
      setSelectedClientId(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const openModal = (id) => {
    setSelectedClientId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClientId(null);
  };

  const viewKycDetails = async (userId) => {
    try {
      const response = await axios.get(`https://trcnfx.com/api/kyc/${userId}`);
      setKycDetails(response.data);
    } catch (error) {
      console.error("Error fetching KYC details:", error);
      setKycDetails(null);
    }
    setShowKycModal(true);
  };

  const closeKycModal = () => {
    setShowKycModal(false);
    setKycDetails(null);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Clients</h2>
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-2">User ID</th>
            <th className="py-2">Email</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client._id}>
              <td className="border px-4 py-2">{client.userId}</td>
              <td className="border px-4 py-2">{client.email}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => openModal(client._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded mr-2"
                >
                  Delete
                </button>
                <button
                  onClick={() => viewKycDetails(client._id)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  View KYC Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        show={showModal}
        onClose={closeModal}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this user?"
      />

      <KycModal
        show={showKycModal}
        onClose={closeKycModal}
        kycDetails={kycDetails}
      />
    </div>
  );
};

export default Clients;
