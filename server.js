
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// --- Helper Functions ---
const readDb = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDb = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
const generateId = () => crypto.randomBytes(8).toString('hex');

// Middleware to check for User ID
const userScoped = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ message: 'User ID is required' });
    }
    req.userId = userId;
    next();
};

const SEED_CATEGORIES = [
    { name: "seedCategories.salary", isSeed: true, type: "income", icon: "dollar-sign", color: "#10B981" },
    { name: "seedCategories.groceries", isSeed: true, type: "expense", icon: "shopping-cart", color: "#EF4444" },
    { name: "seedCategories.rent", isSeed: true, type: "expense", icon: "home", color: "#3B82F6" },
    { name: "seedCategories.transport", isSeed: true, type: "expense", icon: "truck", color: "#F97316" },
    { name: "seedCategories.entertainment", isSeed: true, type: "expense", icon: "film", color: "#8B5CF6" },
];


// --- Authentication ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    
    const db = readDb();
    const user = db.users.find(u => u.email === email);
    
    if (user && user.password === password) {
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
    } else {
        return res.status(401).json({ message: 'Invalid email or password.' });
    }
});

app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const db = readDb();
    if (db.users.find(u => u.email === email)) {
        return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const newUser = { id: generateId(), email, name: email.split('@')[0], password };
    db.users.push(newUser);

    const newBill = { id: generateId(), name: 'Personal', description: 'My personal daily expenses.', userId: newUser.id, createdAt: new Date().toISOString().split('T')[0] };
    db.bills.push(newBill);

    SEED_CATEGORIES.forEach(cat => {
        db.categories.push({ ...cat, id: generateId(), userId: newUser.id, billId: newBill.id });
    });

    writeDb(db);
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
});

// --- User-Scoped & Shared Data Fetching ---
app.get('/api/bills', userScoped, (req, res) => {
    const db = readDb();
    const ownedBills = db.bills
        .filter(b => b.userId === req.userId)
        .map(b => ({ ...b, permission: 'owner' }));

    const shares = db.billShares.filter(bs => bs.sharedWithUserId === req.userId);
    const sharedBillIds = shares.map(s => s.billId);
    
    const sharedBills = db.bills
        .filter(b => sharedBillIds.includes(b.id))
        .map(b => {
            const share = shares.find(s => s.billId === b.id);
            return { ...b, permission: share.permission };
        });

    res.json([...ownedBills, ...sharedBills]);
});

app.get('/api/transactions', userScoped, async (req, res) => {
    const db = readDb();
    // Logic to get all accessible bill IDs (owned and shared)
    const ownedBillIds = db.bills.filter(b => b.userId === req.userId).map(b => b.id);
    const sharedBillIds = db.billShares.filter(bs => bs.sharedWithUserId === req.userId).map(s => s.billId);
    const accessibleBillIds = [...new Set([...ownedBillIds, ...sharedBillIds])];

    const transactions = db.transactions.filter(t => accessibleBillIds.includes(t.billId));
    res.json(transactions);
});

app.get('/api/categories', userScoped, (req, res) => {
    const db = readDb();
    const ownedBillIds = db.bills.filter(b => b.userId === req.userId).map(b => b.id);
    const shares = db.billShares.filter(bs => bs.sharedWithUserId === req.userId);
    const sharedBillIds = shares.map(s => s.billId);
    const accessibleBillIds = [...new Set([...ownedBillIds, ...sharedBillIds])];

    const categories = db.categories.filter(c => accessibleBillIds.includes(c.billId));
    res.json(categories);
});

app.get('/api/billShares', userScoped, (req, res) => {
    const db = readDb();
    res.json(db.billShares.filter(bs => bs.ownerUserId === req.userId));
});

app.get('/api/assets', userScoped, (req, res) => {
    const db = readDb();
    res.json(db.assets.filter(a => a.userId === req.userId));
});


// --- Permission Check Helper ---
const canEditBill = (userId, billId, db) => {
    const bill = db.bills.find(b => b.id === billId);
    if (!bill) return false;
    if (bill.userId === userId) return true; // Is owner

    const share = db.billShares.find(s => s.billId === billId && s.sharedWithUserId === userId);
    return share?.permission === 'edit';
};


// --- Bills CRUD ---
app.post('/api/bills', userScoped, (req, res) => {
    const db = readDb();
    const newBill = { ...req.body, id: generateId(), userId: req.userId, createdAt: new Date().toISOString().split('T')[0] };
    db.bills.push(newBill);
    writeDb(db);
    res.status(201).json({ ...newBill, permission: 'owner' });
});

app.put('/api/bills/:id', userScoped, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    if (!canEditBill(req.userId, id, db)) return res.status(403).json({ message: 'Forbidden' });
    
    const index = db.bills.findIndex(b => b.id === id);
    if (index === -1) return res.status(404).json({ message: `Bill not found` });

    db.bills[index] = { ...db.bills[index], ...req.body };
    writeDb(db);
    res.json(db.bills[index]);
});

app.delete('/api/bills/:id', userScoped, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const bill = db.bills.find(b => b.id === id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    // Only owner can delete a bill
    if (bill.userId !== req.userId) return res.status(403).json({ message: 'Forbidden' });

    db.bills = db.bills.filter(b => b.id !== id);
    db.transactions = db.transactions.filter(t => t.billId !== id);
    db.billShares = db.billShares.filter(bs => bs.billId !== id);
    
    writeDb(db);
    res.status(204).send();
});


// --- Helper for Asset Balance Update ---
const updateAssetBalance = (db, assetId, amount, transactionType) => {
    if (!assetId) return null;
    const assetIndex = db.assets.findIndex(a => a.id === assetId);
    if (assetIndex === -1) return null;

    const asset = db.assets[assetIndex];
    if (transactionType === 'income') {
        asset.balance += amount;
    } else { // expense
        asset.balance -= amount;
    }
    db.assets[assetIndex] = asset;
    return asset;
};


// --- Transactions CRUD ---
app.post('/api/transactions', userScoped, (req, res) => {
    const { billId, assetId, amount, type } = req.body;
    const db = readDb();
    if (!canEditBill(req.userId, billId, db)) return res.status(403).json({ message: 'Forbidden' });
    
    const newTx = { ...req.body, id: generateId(), userId: req.userId };
    db.transactions.push(newTx);
    
    const updatedAsset = updateAssetBalance(db, assetId, parseFloat(amount), type);

    writeDb(db);
    res.status(201).json({ newTransaction: newTx, updatedAsset });
});

app.put('/api/transactions/:id', userScoped, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    
    const originalTxIndex = db.transactions.findIndex(t => t.id === id);
    if (originalTxIndex === -1) return res.status(404).json({ message: 'Transaction not found' });
    const originalTx = { ...db.transactions[originalTxIndex] };

    if (!canEditBill(req.userId, originalTx.billId, db)) return res.status(403).json({ message: 'Forbidden' });
    
    let updatedAssets = [];
    
    // 1. Revert old transaction's effect on asset
    if (originalTx.assetId) {
        // To revert, do the opposite of the original transaction type
        const revertType = originalTx.type === 'income' ? 'expense' : 'income';
        const revertedAsset = updateAssetBalance(db, originalTx.assetId, originalTx.amount, revertType);
        if (revertedAsset) updatedAssets.push(revertedAsset);
    }
    
    // 2. Apply new transaction's effect on asset
    const updatedTxData = { ...db.transactions[originalTxIndex], ...req.body };
    const { assetId, amount, type } = updatedTxData;
    
    if (assetId) {
        const newEffectAsset = updateAssetBalance(db, assetId, parseFloat(amount), type);
        if (newEffectAsset) {
            const existingIndex = updatedAssets.findIndex(a => a.id === newEffectAsset.id);
            if (existingIndex > -1) {
                // If we're updating the same asset, its balance is already correct from the two operations
                const reloadedAsset = db.assets.find(a => a.id === newEffectAsset.id);
                updatedAssets[existingIndex] = reloadedAsset;
            } else {
                updatedAssets.push(newEffectAsset);
            }
        }
    }

    db.transactions[originalTxIndex] = updatedTxData;
    
    writeDb(db);
    res.json({ updatedTransaction: updatedTxData, updatedAssets });
});

app.delete('/api/transactions/:id', userScoped, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    
    const txIndex = db.transactions.findIndex(t => t.id === id);
    if (txIndex === -1) return res.status(404).json({ message: 'Transaction not found' });
    const tx = db.transactions[txIndex];
    
    if (!canEditBill(req.userId, tx.billId, db)) return res.status(403).json({ message: 'Forbidden' });
    
    let updatedAsset = null;
    // Revert transaction's effect
    if (tx.assetId) {
        // To revert, do the opposite: if income, it's an expense; if expense, it's an income.
        const revertType = tx.type === 'income' ? 'expense' : 'income';
        updatedAsset = updateAssetBalance(db, tx.assetId, tx.amount, revertType);
    }
    
    db.transactions = db.transactions.filter(t => t.id !== id);
    writeDb(db);
    res.status(200).json({ deletedTransactionId: id, updatedAsset });
});


// --- Categories CRUD ---
app.post('/api/categories', userScoped, (req, res) => {
    const { billId } = req.body;
    const db = readDb();
    if (!canEditBill(req.userId, billId, db)) return res.status(403).json({ message: 'Forbidden' });

    const newCategory = { ...req.body, id: generateId(), userId: req.userId };
    db.categories.push(newCategory);
    writeDb(db);
    res.status(201).json(newCategory);
});

app.put('/api/categories/:id', userScoped, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const index = db.categories.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ message: 'Category not found' });

    const category = db.categories[index];
    if (!canEditBill(req.userId, category.billId, db)) return res.status(403).json({ message: 'Forbidden' });

    const { billId, ...updateData } = req.body; // Prevent changing billId
    db.categories[index] = { ...category, ...updateData };
    writeDb(db);
    res.json(db.categories[index]);
});

app.delete('/api/categories/:id', userScoped, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const category = db.categories.find(c => c.id === id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    if (!canEditBill(req.userId, category.billId, db)) return res.status(403).json({ message: 'Forbidden' });

    db.categories = db.categories.filter(c => c.id !== id);
    writeDb(db);
    res.status(204).send();
});

app.post('/api/billShares', userScoped, (req, res) => {
    const { email, billId, permission } = req.body;
    const db = readDb();
    const bill = db.bills.find(b => b.id === billId);
    if (!bill || bill.userId !== req.userId) return res.status(403).json({ message: 'You can only share your own bills.' });
    
    const sharedWithUser = db.users.find(u => u.email === email);
    if (!sharedWithUser) return res.status(404).json({ message: 'User to share with not found.' });
    if (sharedWithUser.id === req.userId) return res.status(400).json({ message: 'You cannot share a bill with yourself.' });

    const existingShare = db.billShares.find(bs => bs.billId === billId && bs.sharedWithUserId === sharedWithUser.id);
    if (existingShare) return res.status(409).json({ message: 'This bill is already shared with this user.' });

    const newShare = {
        id: generateId(),
        billId,
        permission,
        ownerUserId: req.userId,
        sharedWithUserId: sharedWithUser.id,
        sharedWithUserEmail: sharedWithUser.email,
    };
    db.billShares.push(newShare);
    writeDb(db);
    res.status(201).json(newShare);
});

app.put('/api/billShares/:id', userScoped, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const index = db.billShares.findIndex(bs => bs.id === id);
    if (index === -1) return res.status(404).json({ message: 'Share not found' });
    if (db.billShares[index].ownerUserId !== req.userId) return res.status(403).json({ message: 'Forbidden' });

    db.billShares[index] = { ...db.billShares[index], ...req.body };
    writeDb(db);
    res.json(db.billShares[index]);
});

app.delete('/api/billShares/:id', userScoped, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const share = db.billShares.find(bs => bs.id === id);
    if (!share) return res.status(404).json({ message: 'Share not found' });
    if (share.ownerUserId !== req.userId) return res.status(403).json({ message: 'Forbidden' });

    db.billShares = db.billShares.filter(bs => bs.id !== id);
    writeDb(db);
    res.status(204).send();
});

// Generic CRUD for owner-only resources
function createCrudEndpoints(resource, pluralResourceName) {
    const pluralResource = pluralResourceName || `${resource}s`;
    app.post(`/api/${pluralResource}`, userScoped, (req, res) => {
        const db = readDb();
        const newItem = { ...req.body, id: generateId(), userId: req.userId };
        db[pluralResource].push(newItem);
        writeDb(db);
        res.status(201).json(newItem);
    });
    app.put(`/api/${pluralResource}/:id`, userScoped, (req, res) => {
        const { id } = req.params;
        const db = readDb();
        const index = db[pluralResource].findIndex(item => item.id === id && item.userId === req.userId);
        if (index === -1) return res.status(404).json({ message: `${resource} not found or access denied` });
        db[pluralResource][index] = { ...db[pluralResource][index], ...req.body };
        writeDb(db);
        res.json(db[pluralResource][index]);
    });
    app.delete(`/api/${pluralResource}/:id`, userScoped, (req, res) => {
        const { id } = req.params;
        const db = readDb();
        const initialLength = db[pluralResource].length;
        const newItems = db[pluralResource].filter(item => !(item.id === id && item.userId === req.userId));
        
        if (newItems.length === initialLength) {
            return res.status(404).json({ message: `${resource} not found or access denied` });
        }

        db[pluralResource] = newItems;
        writeDb(db);
        res.status(204).send();
    });
}

createCrudEndpoints('asset', 'assets');


app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
