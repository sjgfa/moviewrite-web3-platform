// API端点：任务管理系统状态
import taskManager from '../../../lib/task-manager';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetStatus(req, res);
    case 'POST':
      return handleCreateTask(req, res);
    case 'PUT':
      return handleUpdateTask(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// 获取项目状态
async function handleGetStatus(req, res) {
  try {
    const { type = 'summary' } = req.query;
    
    if (type === 'report') {
      const report = taskManager.generateReport();
      return res.status(200).json({
        success: true,
        report
      });
    }
    
    const stats = taskManager.getProjectStats();
    
    res.status(200).json({
      success: true,
      stats,
      message: 'Project status retrieved successfully'
    });
    
  } catch (error) {
    console.error('Status fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch project status',
      message: error.message 
    });
  }
}

// 创建新任务
async function handleCreateTask(req, res) {
  try {
    const { type, data } = req.body;
    
    let result;
    switch (type) {
      case 'epic':
        result = taskManager.createEpic(data);
        break;
      case 'story':
        result = taskManager.createStory(data);
        break;
      case 'task':
        result = taskManager.createTask(data);
        break;
      default:
        return res.status(400).json({ 
          error: 'Invalid task type',
          validTypes: ['epic', 'story', 'task']
        });
    }
    
    res.status(201).json({
      success: true,
      [type]: result,
      message: `${type} created successfully`
    });
    
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create task',
      message: error.message 
    });
  }
}

// 更新任务
async function handleUpdateTask(req, res) {
  try {
    const { taskId, action, data } = req.body;
    
    if (!taskId || !action) {
      return res.status(400).json({ 
        error: 'taskId and action are required' 
      });
    }
    
    let result;
    switch (action) {
      case 'updateStatus':
        result = taskManager.updateTaskStatus(taskId, data.status, data.progress);
        break;
      case 'addEvidence':
        result = taskManager.addEvidence(taskId, data.evidence);
        break;
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          validActions: ['updateStatus', 'addEvidence']
        });
    }
    
    res.status(200).json({
      success: true,
      task: result,
      message: 'Task updated successfully'
    });
    
  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({ 
      error: 'Failed to update task',
      message: error.message 
    });
  }
}