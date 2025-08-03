import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosbase from "../../../axiosbasa";

const AdminContactList = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const getFrom = async () => {
      let res = await axiosbase.get("admin/contect");
      setContacts(res.data);
    };
    getFrom();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contact Messages</h1>
      {contacts.length === 0 ? (
        <p>No contact messages yet.</p>
      ) : (
        <div className="space-y-4">
          {contacts.map((msg, index) => (
            <div key={index} className="p-4 border rounded shadow bg-white">
              <p>
                <strong>Name:</strong> {msg.name}
              </p>
              <p>
                <strong>Email:</strong> {msg.email}
              </p>
              <p>
                <strong>Phone:</strong> {msg.phone}
              </p>
              <p>
                <strong>Subject:</strong> {msg.subject}
              </p>
              <p>
                <strong>Message:</strong> {msg.message}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(msg.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContactList;
