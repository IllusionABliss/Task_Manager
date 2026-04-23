const cron = require('node-cron');
const Task = require('../models/Task');
const { sendEmail } = require('../utils/sendMail');

cron.schedule('0 * * * *', async () => {
  const now = new Date();
  const tasks = await Task.find({
    status: { $ne: 'Completed' },
    dueDate: { $lt: now },
    notifiedOverdue: false
  }).populate('assignedTo');

  for (const task of tasks) {
    for (const user of task.assignedTo) {
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: `Task Overdue: ${task.title}`,
          text: `Your task "${task.title}" was due on ${task.dueDate.toDateString()}. Complete the task as soon as possible.`
        });
      }
    }

      task.notifiedOverdue = true;
      await task.save();
    }
});
