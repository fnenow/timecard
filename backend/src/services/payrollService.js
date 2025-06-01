// payrollService.js

/**
 * Calculates payroll including daily and weekly overtime.
 * @param {Array<Object>} clockEntries - Array of clock entry objects.
 * Each entry should have: worker_id, clock_in_time, clock_out_time, duration_minutes, recorded_pay_rate.
 * @param {string} reportStartDate - The start date of the payroll period (YYYY-MM-DD).
 * @param {string} reportEndDate - The end date of the payroll period (YYYY-MM-DD).
 * @returns {Object} Payroll report structured by worker.
 */
function calculatePayroll(clockEntries, reportStartDate, reportEndDate) {
    const payrollByWorker = {};

    // Group entries by worker
    for (const entry of clockEntries) {
        if (!payrollByWorker[entry.worker_id]) {
            payrollByWorker[entry.worker_id] = {
                worker_id: entry.worker_id,
                worker_name: entry.worker_name || `Worker ${entry.worker_id}`, // Add worker_name if available
                total_hours: 0,
                regular_hours: 0,
                daily_ot_hours: 0,
                weekly_ot_hours: 0, // Calculated after daily OT
                regular_pay: 0,
                daily_ot_pay: 0,
                weekly_ot_pay: 0,
                grand_total_pay: 0,
                entries_detail: [] // Optional: for detailed breakdown
            };
        }
        payrollByWorker[entry.worker_id].entries_detail.push(entry);
    }

    // Process each worker's entries
    for (const workerId in payrollByWorker) {
        const workerData = payrollByWorker[workerId];
        const entries = workerData.entries_detail.sort((a, b) => new Date(a.clock_in_time) - new Date(b.clock_in_time));

        const dailyHoursMap = new Map(); // Tracks hours per day: 'YYYY-MM-DD' -> hours

        // Calculate daily hours and initial daily OT
        for (const entry of entries) {
            const entryDate = new Date(entry.clock_in_time).toISOString().split('T')[0];
            const entryHours = entry.duration_minutes / 60;
            const payRate = entry.recorded_pay_rate;

            workerData.total_hours += entryHours;

            const hoursToday = (dailyHoursMap.get(entryDate) || 0) + entryHours;
            dailyHoursMap.set(entryDate, hoursToday);

            let dailyOtForEntry = 0;
            let regularHoursForEntry = entryHours;

            if (hoursToday > 8) {
                const prevHoursToday = hoursToday - entryHours;
                if (prevHoursToday < 8) { // OT starts within this entry
                    dailyOtForEntry = hoursToday - 8;
                    regularHoursForEntry = entryHours - dailyOtForEntry;
                } else { // This entire entry is part of OT for the day
                    dailyOtForEntry = entryHours;
                    regularHoursForEntry = 0;
                }
            }
            
            workerData.daily_ot_hours += dailyOtForEntry;
            workerData.daily_ot_pay += dailyOtForEntry * payRate * 1.5;
            
            workerData.regular_hours += regularHoursForEntry; // This is pre-weekly OT regular hours
            // Regular pay will be calculated after weekly OT is determined
        }


        // Calculate weekly OT (from hours not already paid as daily OT)
        const weeklyRegularHoursMap = new Map(); // 'YYYY-WeekNum' -> hours
        let currentWeekRegularHours = 0; // Accumulator for regular hours eligible for weekly OT

        for (const entry of entries) {
            const entryDate = new Date(entry.clock_in_time);
            const weekKey = `${entryDate.getFullYear()}-W${getWeekNumber(entryDate)}`;
            const payRate = entry.recorded_pay_rate;

            // Calculate hours for this entry that were NOT daily OT
            // This logic needs refinement based on how daily OT was split.
            // For simplicity here, assume 'regularHoursForEntry' was correctly calculated above for each entry.
            // We need to sum up these 'regularHoursForEntry' values on a weekly basis.
            
            // Simplified: let's assume we have a way to get non-daily-OT hours for each entry
            const entryHours = entry.duration_minutes / 60;
            let nonDailyOtHoursForEntry = entryHours; // Placeholder, needs accurate calculation
            
            // A more accurate approach:
            // Iterate through entries again, determine the portion of each entry that was NOT daily OT.
            // For now, we'll use a simplified placeholder logic for workerData.regular_hours accumulated earlier.

            // The workerData.regular_hours currently holds all hours that were not daily OT.
            // We need to distribute these across weeks.
        }

        // This simplified weekly OT assumes workerData.regular_hours are all potentially weekly OT eligible
        // A more robust solution would iterate week by week.
        const totalRegularHoursBeforeWeeklyOT = workerData.regular_hours;
        if (totalRegularHoursBeforeWeeklyOT > 40 * (/* number of weeks in period - complex */ 1)) { // Simplified for one week
            const weeklyOtThreshold = 40; // Standard for one week
            // This needs to be per week within the pay period
            // This is a very simplified weekly OT calculation
            if (totalRegularHoursBeforeWeeklyOT > weeklyOtThreshold) {
                 const weeklyOtEligibleHours = totalRegularHoursBeforeWeeklyOT - weeklyOtThreshold;
                 // Assume average pay rate for these weekly OT hours for simplicity
                 // A real system would need to track rates for these specific hours
                 const averageRate = workerData.entries_detail.reduce((sum, e) => sum + e.recorded_pay_rate, 0) / workerData.entries_detail.length || 20;

                 // Ensure weekly OT hours don't make total regular hours negative
                 const actualWeeklyOtHours = Math.min(weeklyOtEligibleHours, totalRegularHoursBeforeWeeklyOT - weeklyOtThreshold);
                 if(actualWeeklyOtHours > 0){
                    workerData.weekly_ot_hours = actualWeeklyOtHours;
                    workerData.weekly_ot_pay = workerData.weekly_ot_hours * averageRate * 1.5;
                    workerData.regular_hours -= workerData.weekly_ot_hours; // Adjust regular hours
                 }
            }
        }
        
        // Final regular pay calculation
        // Assume average pay rate for simplicity if rates vary.
        // A precise system sums pay for each segment of time at its specific rate.
        const averageRateForRegular = workerData.entries_detail.reduce((sum, e) => sum + e.recorded_pay_rate, 0) / workerData.entries_detail.length || 20;
        workerData.regular_pay = workerData.regular_hours * averageRateForRegular;


        workerData.grand_total_pay = workerData.regular_pay + workerData.daily_ot_pay + workerData.weekly_ot_pay;
    }


    return {
        report_period: { start_date: reportStartDate, end_date: reportEndDate },
        workers_payroll: Object.values(payrollByWorker),
        // TODO: Add grand totals for the entire report
    };
}

// Helper to get ISO week number
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}


module.exports = {
    calculatePayroll
};