const Worker = require('../models/workerModel');
const PayRate = require('../models/payRateModel');
const ClockEntry = require('../models/clockEntryModel');

// TODO: Add proper error handling and input validation to all methods

exports.createWorker = async (req, res) => {
    try {
        // const newWorker = await Worker.create(req.body);
        // res.status(201).json(newWorker);
        res.status(201).json({ message: 'Worker.create called', data: req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error creating worker', error: error.message });
    }
};

exports.getAllWorkers = async (req, res) => {
    try {
        // const workers = await Worker.findAll();
        // res.status(200).json(workers);
        res.status(200).json({ message: 'Worker.findAll called' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching workers', error: error.message });
    }
};

exports.getWorkerById = async (req, res) => {
    try {
        // const worker = await Worker.findById(req.params.workerId);
        // if (!worker) return res.status(404).json({ message: 'Worker not found' });
        // res.status(200).json(worker);
        res.status(200).json({ message: 'Worker.findById called', id: req.params.workerId });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching worker', error: error.message });
    }
};

exports.updateWorker = async (req, res) => {
    try {
        // const updatedWorker = await Worker.update(req.params.workerId, req.body);
        // if (!updatedWorker) return res.status(404).json({ message: 'Worker not found' });
        // res.status(200).json(updatedWorker);
        res.status(200).json({ message: 'Worker.update called', id: req.params.workerId, data: req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error updating worker', error: error.message });
    }
};

exports.addPayRate = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { rateAmount, effectiveStartDate } = req.body;
        // const newPayRate = await PayRate.add(workerId, rateAmount, effectiveStartDate);
        // res.status(201).json(newPayRate);
        res.status(201).json({ message: 'PayRate.add called', workerId, rateAmount, effectiveStartDate });
    } catch (error) {
        res.status(500).json({ message: 'Error adding pay rate', error: error.message });
    }
};

exports.getPayRatesForWorker = async (req, res) => {
    try {
        // const payRates = await PayRate.findByWorkerId(req.params.workerId);
        // res.status(200).json(payRates);
        res.status(200).json({ message: 'PayRate.findByWorkerId called', workerId: req.params.workerId });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pay rates', error: error.message });
    }
};

exports.getWorkerTimeEntries = async (req, res) => {
    try {
        // const timeEntries = await ClockEntry.findByWorkerId(req.params.workerId, req.query); // req.query for date filters
        // res.status(200).json(timeEntries);
        res.status(200).json({ message: 'ClockEntry.findByWorkerId for worker view called', workerId: req.params.workerId, filters: req.query });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching time entries', error: error.message });
    }
};

exports.getWorkerStatuses = async (req, res) => {
    try {
        // const statuses = await ClockEntry.getCurrentStatuses();
        // res.status(200).json(statuses);
        res.status(200).json({ message: 'ClockEntry.getCurrentStatuses called' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching worker statuses', error: error.message });
    }
};