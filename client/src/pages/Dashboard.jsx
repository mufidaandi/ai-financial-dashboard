import axios from "axios";
import { useState } from "react";

function Dashboard() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [transactions, setTransactions] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token"); // make sure token is stored at login

      if (!token) {
        alert("You must be logged in to add transactions.");
        return;
      }

      const res = await axios.post(
        "http://localhost:3000/api/transactions",
        {
          description,
          amount,
          category,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔑 include token
          },
        }
      );

      setTransactions([...transactions, res.data]); // add new transaction to UI
      setDescription("");
      setAmount("");
      setCategory("");
    } catch (err) {
      console.error("Error adding transaction:", err);
      alert("Failed to add transaction. Check console for details.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <button type="submit">Add Transaction</button>
    </form>
  );
}

export default Dashboard;
