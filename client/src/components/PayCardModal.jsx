import { useState, useEffect } from "react";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { CreditCard } from "lucide-react";
import { useToast } from "../context/ToastContext";

function PayCardModal({ isOpen, onClose, creditCard, accounts, onPayment }) {
  const { error } = useToast();
  const [form, setForm] = useState({
    amount: "",
    fromAccount: "",
    toAccount: creditCard?._id || "",
    date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update form when creditCard changes
  useEffect(() => {
    if (creditCard) {
      setForm(prev => ({
        ...prev,
        toAccount: creditCard._id
      }));
    }
  }, [creditCard]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.amount || !form.fromAccount || !form.toAccount || !form.date) {
      error("Please fill in all fields");
      return;
    }

    if (parseFloat(form.amount) <= 0) {
      error("Amount must be greater than 0");
      return;
    }

    if (form.fromAccount === form.toAccount) {
      error("From Account and To Account cannot be the same");
      return;
    }

    setIsLoading(true);
    try {
      await onPayment(form);
      onClose();
      // Reset form
      setForm({
        amount: "",
        fromAccount: "",
        toAccount: creditCard?._id || "",
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      error("Error processing payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    setForm({
      amount: "",
      fromAccount: "",
      toAccount: creditCard?._id || "",
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Filter out credit cards from "from account" options (only allow paying FROM non-credit accounts)
  const fromAccountOptions = accounts.filter(acc => acc.type !== "Credit Card");

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-bold dark:text-gray-100">Pay Credit Card</h2>
      </div>
      
      {creditCard && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Paying:</p>
          <p className="font-semibold dark:text-gray-100">{creditCard.name}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-100">
            Amount <span className="text-red-500">*</span>
          </label>
          <Input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
            required
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-100">
            From Account <span className="text-red-500">*</span>
          </label>
          <Select
            name="fromAccount"
            value={form.fromAccount}
            onChange={handleChange}
            required
            className="w-full"
          >
            <option value="">Select account to pay from</option>
            {fromAccountOptions.map(account => (
              <option key={account._id} value={account._id}>
                {account.name} ({account.type})
                {(account.type === "Savings" || account.type === "Checking") && account.balance !== undefined 
                  ? ` - $${account.balance.toFixed(2)}` 
                  : ''}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-100">
            To Account <span className="text-red-500">*</span>
          </label>
          <Select
            name="toAccount"
            value={form.toAccount}
            onChange={handleChange}
            required
            className="w-full"
            disabled // Credit card is pre-selected and cannot be changed
          >
            {creditCard && (
              <option value={creditCard._id}>
                {creditCard.name} (Credit Card)
              </option>
            )}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-100">
            Date <span className="text-red-500">*</span>
          </label>
          <Input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
            className="w-full"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Processing..." : "Pay Card"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default PayCardModal;