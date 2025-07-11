import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(null); // Tracks item ID being updated
  const [isDeleting, setIsDeleting] = useState(null); // Tracks item ID being deleted

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoadingItems(true);
    try {
      const response = await fetch('http://localhost:3000/items', { credentials: 'include' });
      const data = await response.json();
      setItems(data.items);
      setSessionId(data.sessionId);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const addItem = async () => {
    if (!newItemName) return;
    setIsAdding(true);
    try {
      await axios.post(
        'http://localhost:3000/items',
        { name: newItemName },
        { withCredentials: true }
      );
      setNewItemName('');
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error.response?.data || error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const updateItem = async (id) => {
    if (!editItem.name) return;
    setIsUpdating(id);
    try {
      const response = await fetch(`http://localhost:3000/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editItem.name }),
        credentials: 'include',
      });
      if (response.ok) {
        setEditItem(null);
        fetchItems();
      }
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteItem = async (id) => {
    setIsDeleting(id);
    try {
      const response = await fetch(`http://localhost:3000/items/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Items Manager</h1>
      <p className="mb-4">Session ID: {sessionId}</p>

      {isLoadingItems ? (
        <div className="flex justify-center mb-4">
          <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
        </div>
      ) : null}

      {/* Add Item */}
      <div className="mb-4 flex">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Enter item name"
          className="border p-2 mr-2 flex-grow"
          disabled={isAdding}
        />
        <button
          onClick={addItem}
          className={`bg-blue-500 text-white p-2 rounded flex items-center ${
            isAdding ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isAdding}
        >
          {isAdding ? (
            <>
              <span className="spinner border-t-2 border-white border-solid rounded-full w-4 h-4 animate-spin mr-2"></span>
              Loading...
            </>
          ) : (
            'Add Item'
          )}
        </button>
      </div>

      {/* Item List */}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between border p-2">
            {editItem?.id === item.id ? (
              <>
                <input
                  type="text"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  className="border p-1 flex-grow"
                  disabled={isUpdating === item.id}
                />
                <div className="flex">
                  <button
                    onClick={() => updateItem(item.id)}
                    className={`bg-green-500 text-white p-1 mr-1 rounded flex items-center ${
                      isUpdating === item.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isUpdating === item.id}
                  >
                    {isUpdating === item.id ? (
                      <>
                        <span className="spinner border-t-2 border-white border-solid rounded-full w-4 h-4 animate-spin mr-2"></span>
                        Loading...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                  <button
                    onClick={() => setEditItem(null)}
                    className="bg-gray-500 text-white p-1 rounded"
                    disabled={isUpdating === item.id}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span>{item.name}</span>
                <div className="flex">
                  <button
                    onClick={() => setEditItem(item)}
                    className="bg-yellow-500 text-white p-1 mr-1 rounded"
                    disabled={isDeleting === item.id}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className={`bg-red-500 text-white p-1 rounded flex items-center ${
                      isDeleting === item.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isDeleting === item.id}
                  >
                    {isDeleting === item.id ? (
                      <>
                        <span className="spinner border-t-2 border-white border-solid rounded-full w-4 h-4 animate-spin mr-2"></span>
                        Loading...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;