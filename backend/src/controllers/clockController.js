const ClockEntry = require('../models/clockEntryModel');
const PayRate = require('../models/payRateModel');

// TODO: Add proper error handling and input validation

exports.clockIn = async (req, res) => {
    try {
        const { workerId, projectId, timezone } = req.body;
        if (!workerId || !projectId) {
            return res.status(400).json({ message: 'Worker ID and Project ID are required.' });
        }

        // Check if worker is already clocked in
        // const existingEntry = await ClockEntry.findOpenEntryByWorkerId(workerId);
        // if (existingEntry) {
        //     return res.status(400).json({ message: 'Worker is already clocked in.', entry: existingEntry });
        // }

        // Get current pay rate for the worker
        // const currentPayRate = await PayRate.getCurrentEffectiveRate(workerId);
        // if (!currentPayRate || !currentPayRate.rate_amount) {
        //     return res.status(400).json({ message: 'Could not determine current pay rate for worker.' });
        // }

        const clockInTime = new Date();
        // const newEntry = await ClockEntry.create({
        //     worker_id: workerId,
        //     project_id: projectId,
        //     clock_in_time: clockInTime,
        //     original_timezone: timezone,
        //     recorded_pay_rate: currentPayRate.rate_amount
        // });
        // res.status(201).json(newEntry);
        res.status(201).json({
            message: 'ClockEntry.create (clock-in) called',
            data: { workerId, projectId, timezone, clockInTime, recorded_pay_rate: 20.00 /* placeholder */ }
        });

    } catch (error) {
        res.status(500).json({ message: 'Error clocking in', error: error.message });
    }
};

exports.clockOut = async (req, res) => {
    try {
        const { workerId /* or entryId */ } = req.body; // Prefer entryId if frontend can manage it
        if (!workerId) {
            return res.status(400).json({ message: 'Worker ID is required.' });
        }

        // const openEntry = await ClockEntry.findOpenEntryByWorkerId(workerId);
        // if (!openEntry) {
        //     return res.status(400).json({ message: 'No open clock entry found for this worker to clock out.' });
        // }

        const clockOutTime = new Date();
        // const durationMinutes = Math.round((clockOutTime - new Date(openEntry.clock_in_time)) / (1000 * 60));

        // const updatedEntry = await ClockEntry.update(openEntry.entry_id, {
        //     clock_out_time: clockOutTime,
        //     duration_minutes: durationMinutes
        // });
        // res.status(200).json(updatedEntry);
         res.status(200).json({
            message: 'ClockEntry.update (clock-out) called',
            data: { workerId, clockOutTime, duration_minutes: 60 /* placeholder */ }
        });

    } catch (error) {
        res.status(500).json({ message: 'Error clocking out', error: error.message });
    }
};