import React, { useEffect, useState } from "react";
import axiosbase from "../../../axiosbasa";
import { Mail, Phone, MessageSquare, Clock, Inbox } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription } from "../ui/alert";

const ContactSkeleton = () => (
  <Card className="border-gray-700">
    <CardContent className="p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-16 w-full" />
    </CardContent>
  </Card>
);

const AdminContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axiosbase.get("admin/contect");
        // Support both old array response and new paginated response
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setContacts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Inbox className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Contact Messages</h1>
          <p className="text-sm text-gray-400">
            {contacts.length} message{contacts.length !== 1 ? "s" : ""} received
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ContactSkeleton key={i} />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <Card className="border-gray-700 border-dashed">
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" aria-hidden="true" />
            <p className="text-gray-400 text-lg font-medium">No messages yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Contact form submissions will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contacts.map((msg) => (
            <Card key={msg._id} className="border-gray-700 hover:border-gray-500 transition-colors">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Name + Subject */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white truncate">{msg.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {msg.subject}
                      </Badge>
                    </div>

                    {/* Contact details */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                        <a
                          href={`mailto:${msg.email}`}
                          className="hover:text-white transition-colors"
                        >
                          {msg.email}
                        </a>
                      </span>
                      {msg.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                          {msg.phone}
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    <p className="text-sm text-gray-300 bg-gray-700/50 rounded-lg p-3 mt-2">
                      {msg.message}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    <time dateTime={msg.createdAt}>
                      {new Date(msg.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContactList;
