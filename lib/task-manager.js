// 任务管理系统 - 用于跟踪MovieWrite转型项目的任务执行
const fs = require('fs');
const path = require('path');

class TaskManager {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.taskFile = path.join(this.dataDir, 'tasks.json');
    this.ensureDataDir();
    this.tasks = this.loadTasks();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  loadTasks() {
    try {
      if (fs.existsSync(this.taskFile)) {
        const rawData = fs.readFileSync(this.taskFile, 'utf8');
        return JSON.parse(rawData);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
    
    // 初始任务结构
    return {
      project: {
        code: 'MWT-MIRROR-V2',
        name: 'MovieWrite Mirror风格转型',
        startDate: new Date().toISOString(),
        phase: 'Phase 2A',
        status: 'active'
      },
      epics: {},
      stories: {},
      tasks: {},
      history: []
    };
  }

  saveTasks() {
    try {
      fs.writeFileSync(this.taskFile, JSON.stringify(this.tasks, null, 2));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }

  // 创建Epic
  createEpic(epicData) {
    const epic = {
      id: epicData.id,
      title: epicData.title,
      priority: epicData.priority || 'medium',
      estimatedWeeks: epicData.estimatedWeeks,
      status: 'pending',
      stories: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.tasks.epics[epic.id] = epic;
    this.addHistory('epic_created', { epicId: epic.id });
    this.saveTasks();
    return epic;
  }

  // 创建Story
  createStory(storyData) {
    const story = {
      id: storyData.id,
      epicId: storyData.epicId,
      title: storyData.title,
      priority: storyData.priority || 'medium',
      status: 'pending',
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.tasks.stories[story.id] = story;
    
    // 关联到Epic
    if (this.tasks.epics[story.epicId]) {
      this.tasks.epics[story.epicId].stories.push(story.id);
    }
    
    this.addHistory('story_created', { storyId: story.id, epicId: story.epicId });
    this.saveTasks();
    return story;
  }

  // 创建Task
  createTask(taskData) {
    const task = {
      id: taskData.id,
      storyId: taskData.storyId,
      title: taskData.title,
      description: taskData.description,
      assignee: taskData.assignee,
      priority: taskData.priority || 'medium',
      status: 'pending',
      progress: 0,
      estimatedHours: taskData.estimatedHours,
      actualHours: 0,
      evidence: [],
      dependencies: taskData.dependencies || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.tasks.tasks[task.id] = task;
    
    // 关联到Story
    if (this.tasks.stories[task.storyId]) {
      this.tasks.stories[task.storyId].tasks.push(task.id);
    }
    
    this.addHistory('task_created', { taskId: task.id, storyId: task.storyId });
    this.saveTasks();
    return task;
  }

  // 更新任务状态
  updateTaskStatus(taskId, status, progress = null) {
    const task = this.tasks.tasks[taskId];
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    const oldStatus = task.status;
    task.status = status;
    
    if (progress !== null) {
      task.progress = Math.min(100, Math.max(0, progress));
    }
    
    task.updatedAt = new Date().toISOString();
    
    // 如果任务完成，更新实际工时
    if (status === 'completed' && task.startedAt) {
      task.actualHours = this.calculateHours(task.startedAt, new Date().toISOString());
    } else if (status === 'in-progress' && !task.startedAt) {
      task.startedAt = new Date().toISOString();
    }
    
    this.addHistory('task_updated', { 
      taskId, 
      oldStatus, 
      newStatus: status, 
      progress: task.progress 
    });
    
    // 更新Story和Epic状态
    this.updateParentStatus(task.storyId);
    
    this.saveTasks();
    return task;
  }

  // 更新父级状态
  updateParentStatus(storyId) {
    const story = this.tasks.stories[storyId];
    if (!story) return;
    
    const tasks = story.tasks.map(id => this.tasks.tasks[id]);
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    
    if (completedTasks === totalTasks && totalTasks > 0) {
      story.status = 'completed';
    } else if (tasks.some(t => t.status === 'in-progress')) {
      story.status = 'in-progress';
    }
    
    // 更新Epic状态
    const epic = this.tasks.epics[story.epicId];
    if (epic) {
      const stories = epic.stories.map(id => this.tasks.stories[id]);
      const completedStories = stories.filter(s => s.status === 'completed').length;
      const totalStories = stories.length;
      
      if (completedStories === totalStories && totalStories > 0) {
        epic.status = 'completed';
      } else if (stories.some(s => s.status === 'in-progress')) {
        epic.status = 'in-progress';
      }
    }
  }

  // 添加证据
  addEvidence(taskId, evidence) {
    const task = this.tasks.tasks[taskId];
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    task.evidence.push({
      type: evidence.type,
      description: evidence.description,
      url: evidence.url,
      addedAt: new Date().toISOString()
    });
    
    task.updatedAt = new Date().toISOString();
    
    this.addHistory('evidence_added', { taskId, evidence });
    this.saveTasks();
    return task;
  }

  // 获取项目统计
  getProjectStats() {
    const epics = Object.values(this.tasks.epics);
    const stories = Object.values(this.tasks.stories);
    const tasks = Object.values(this.tasks.tasks);
    
    return {
      project: this.tasks.project,
      epics: {
        total: epics.length,
        completed: epics.filter(e => e.status === 'completed').length,
        inProgress: epics.filter(e => e.status === 'in-progress').length,
        pending: epics.filter(e => e.status === 'pending').length
      },
      stories: {
        total: stories.length,
        completed: stories.filter(s => s.status === 'completed').length,
        inProgress: stories.filter(s => s.status === 'in-progress').length,
        pending: stories.filter(s => s.status === 'pending').length
      },
      tasks: {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        pending: tasks.filter(t => t.status === 'pending').length,
        blocked: tasks.filter(t => t.status === 'blocked').length
      },
      progress: this.calculateOverallProgress(),
      velocity: this.calculateVelocity()
    };
  }

  // 计算整体进度
  calculateOverallProgress() {
    const tasks = Object.values(this.tasks.tasks);
    if (tasks.length === 0) return 0;
    
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / tasks.length);
  }

  // 计算速度
  calculateVelocity() {
    const completedTasks = Object.values(this.tasks.tasks)
      .filter(t => t.status === 'completed' && t.actualHours > 0);
    
    if (completedTasks.length === 0) return null;
    
    const totalEstimated = completedTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
    const totalActual = completedTasks.reduce((sum, t) => sum + t.actualHours, 0);
    
    return {
      accuracy: Math.round((totalEstimated / totalActual) * 100),
      averageHoursPerTask: Math.round(totalActual / completedTasks.length)
    };
  }

  // 获取任务依赖关系
  getTaskDependencies(taskId) {
    const task = this.tasks.tasks[taskId];
    if (!task) return [];
    
    return task.dependencies.map(depId => {
      const depTask = this.tasks.tasks[depId];
      return {
        id: depId,
        title: depTask ? depTask.title : 'Unknown',
        status: depTask ? depTask.status : 'unknown',
        isBlocking: depTask && depTask.status !== 'completed'
      };
    });
  }

  // 添加历史记录
  addHistory(action, data) {
    this.tasks.history.push({
      action,
      data,
      timestamp: new Date().toISOString()
    });
    
    // 保留最近1000条记录
    if (this.tasks.history.length > 1000) {
      this.tasks.history = this.tasks.history.slice(-1000);
    }
  }

  // 计算工时
  calculateHours(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 10) / 10; // 保留一位小数
  }

  // 生成报告
  generateReport() {
    const stats = this.getProjectStats();
    const report = {
      generatedAt: new Date().toISOString(),
      project: stats.project,
      summary: {
        overallProgress: `${stats.progress}%`,
        epicsCompleted: `${stats.epics.completed}/${stats.epics.total}`,
        storiesCompleted: `${stats.stories.completed}/${stats.stories.total}`,
        tasksCompleted: `${stats.tasks.completed}/${stats.tasks.total}`,
        velocity: stats.velocity
      },
      activeWork: {
        inProgressEpics: Object.values(this.tasks.epics)
          .filter(e => e.status === 'in-progress')
          .map(e => ({ id: e.id, title: e.title })),
        inProgressTasks: Object.values(this.tasks.tasks)
          .filter(t => t.status === 'in-progress')
          .map(t => ({ 
            id: t.id, 
            title: t.title, 
            assignee: t.assignee,
            progress: `${t.progress}%`
          }))
      },
      blockedItems: Object.values(this.tasks.tasks)
        .filter(t => t.status === 'blocked')
        .map(t => ({ 
          id: t.id, 
          title: t.title,
          blockedBy: this.getTaskDependencies(t.id).filter(d => d.isBlocking)
        }))
    };
    
    return report;
  }
}

// 导出单例实例
module.exports = new TaskManager();