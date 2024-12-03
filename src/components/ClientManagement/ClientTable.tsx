"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Loader/Modal";
import DetailModal from "@/components/common/Loader/DetailModal";

interface Client {
    id: number;
    name: string;
    contractId: string;
    listCount: number;
    contactAddress: string;
    requestCount: number;
    memo: string;
    updatedAt: Date;
}

const ClientTable = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [newClient, setNewClient] = useState({ name: "" });
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get("http://localhost:3001/api/clients");
                setClients(response.data);
            } catch (error) {
                console.error("Error fetching clients:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    const handleChangeFlag = (flag: boolean) => {
        setIsReadOnly(!flag); // Update read-only based on flag
    };

    const handleAddClient = async () => {
        try {
            const response = await axios.post("http://localhost:3001/api/add_client", newClient);
            setClients((prev) => [...prev, response.data]);
            setNewClient({ name: "" });
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Error adding client:", error);
        }
    };

    const handleSaveSelectedClient = async () => {
        if (!selectedClient) return;

        try {
            await axios.put(`http://localhost:3001/api/update_client/${selectedClient.id}`, selectedClient);
            setClients((prev) =>
                prev.map((client) => (client.id === selectedClient.id ? selectedClient : client))
            );
            setIsDetailModalOpen(false);
            setSelectedClient(null);
        } catch (error) {
            console.error("Error updating client:", error);
        }
    };

    const openDetailModal = (client: Client) => {
        setSelectedClient(client);
        setIsDetailModalOpen(true);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <button
                className="m-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => setIsAddModalOpen(true)}
            >
                新規登録
            </button>
            <div className="rounded-sm border mx-4 px-6 pb-2.5 pt-6 shadow-default bg-slate-900 border-strokedark sm:px-8 xl:pb-1">
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-2 text-left">
                                <th className="min-w-[40px] px-4 py-4 font-medium text-white">No</th>
                                <th className="min-w-[150px] px-4 py-4 font-medium text-white">契約ID</th>
                                <th className="min-w-[150px] px-4 py-4 font-medium text-white">クライアント名</th>
                                <th className="min-w-[120px] px-4 py-4 font-medium text-white">合計リスト数</th>
                                <th className="px-4 py-4 font-medium text-white">合計依頼数</th>
                                <th className="px-4 py-4 font-medium text-white">更新日</th>
                                <th className="px-4 py-4 font-medium text-white"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client, index) => (
                                <tr key={client.id}>
                                    <td className="border-b px-4 py-5 text-white">{index + 1}</td>
                                    <td className="border-b px-4 py-5 text-white">{client.contractId}</td>
                                    <td className="border-b px-4 py-5 text-white">{client.name}</td>
                                    <td className="border-b px-4 py-5 text-white">{client.listCount}</td>
                                    <td className="border-b px-4 py-5 text-white">{client.requestCount}</td>
                                    <td className="border-b px-4 py-5 text-white">
                                        {client.updatedAt
                                            ? new Intl.DateTimeFormat("ja-JP", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }).format(new Date(client.updatedAt))
                                            : "N/A"}
                                    </td>
                                    <td className="border-b px-4 py-5 text-white">
                                        <button
                                            className="text-blue-500 hover:underline"
                                            onClick={() => openDetailModal(client)}
                                        >
                                            詳細
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Client Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <h2 className="text-lg font-bold mb-4 text-gray-700">新規クライアント登録</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700">クライアント名</label>
                        <input
                            type="text"
                            value={newClient.name}
                            onChange={(e) => setNewClient({ name: e.target.value })}
                            className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={handleAddClient}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            登録する
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Detail Modal */}
            {selectedClient && (
                <DetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    onSave={handleSaveSelectedClient}
                    onChangeFlag={handleChangeFlag}
                >
                    <h2 className="text-lg font-bold mb-4 text-gray-700">クライアント詳細</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700">契約ID</label>
                            <input
                                type="text"
                                value={selectedClient.contractId}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">契約アドレス</label>
                            <input
                                type="text"
                                value={selectedClient.contactAddress}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">クライアント名</label>
                            <input
                                type="text"
                                value={selectedClient.name}
                                onChange={(e) =>
                                    setSelectedClient((prev) => ({ ...prev, name: e.target.value } as Client))
                                }
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly={isReadOnly}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">リスト数</label>
                            <input
                                type="number"
                                value={selectedClient.listCount}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">依頼数</label>
                            <input
                                type="number"
                                value={selectedClient.requestCount}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700">更新日</label>
                            <input
                                type="text"
                                value={selectedClient.updatedAt
                                    ? new Intl.DateTimeFormat("ja-JP", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }).format(new Date(selectedClient.updatedAt))
                                    : "N/A"}
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">メモ</label>
                            <textarea
                                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray-500"
                                onChange={(e) =>
                                    setSelectedClient((prev) => ({ ...prev, memo: e.target.value } as Client))
                                }
                                value={selectedClient.memo || ""}
                                readOnly={isReadOnly}
                            />
                        </div>
                    </div>
                </DetailModal>
            )}
        </>
    );
};

export default ClientTable;
