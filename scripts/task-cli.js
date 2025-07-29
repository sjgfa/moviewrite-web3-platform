#!/usr/bin/env node

// MovieWrite任务管理CLI工具
const taskManager = require('../lib/task-manager');
const { format } = require('date-fns');

// 解析命令行参数
const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// 显示帮助信息
function showHelp() {
  console.log(`
${colorize('MovieWrite Task Management CLI', 'bright')}

${colorize('Usage:', 'cyan')}
  node scripts/task-cli.js [command] [options]

${colorize('Commands:', 'cyan')}
  ${colorize('status', 'green')}              显示项目状态
  ${colorize('report', 'green')}              生成项目报告
  ${colorize('create', 'green')} [type]        创建新任务 (epic/story/task)
  ${colorize('update', 'green')} [id]          更新任务状态
  ${colorize('list', 'green')} [type]          列出任务 (epics/stories/tasks)
  ${colorize('init', 'green')}                初始化项目任务

${colorize('Examples:', 'cyan')}
  node scripts/task-cli.js status
  node scripts/task-cli.js create epic
  node scripts/task-cli.js update MWT-T001 --status in-progress
  node scripts/task-cli.js list tasks --status pending
`);
}

// 显示项目状态
function showStatus() {
  const stats = taskManager.getProjectStats();
  
  console.log(`\n${colorize('MovieWrite Mirror转型项目状态', 'bright')}\n`);
  console.log(`项目代码: ${colorize(stats.project.code, 'cyan')}`);
  console.log(`当前阶段: ${colorize(stats.project.phase, 'yellow')}`);
  console.log(`项目状态: ${colorize(stats.project.status, 'green')}\n`);
  
  console.log(colorize('Epic进度:', 'bright'));
  console.log(`  总数: ${stats.epics.total}`);
  console.log(`  已完成: ${colorize(stats.epics.completed, 'green')}`);
  console.log(`  进行中: ${colorize(stats.epics.inProgress, 'yellow')}`);
  console.log(`  待处理: ${colorize(stats.epics.pending, 'red')}\n`);
  
  console.log(colorize('Story进度:', 'bright'));
  console.log(`  总数: ${stats.stories.total}`);
  console.log(`  已完成: ${colorize(stats.stories.completed, 'green')}`);
  console.log(`  进行中: ${colorize(stats.stories.inProgress, 'yellow')}`);
  console.log(`  待处理: ${colorize(stats.stories.pending, 'red')}\n`);
  
  console.log(colorize('Task进度:', 'bright'));
  console.log(`  总数: ${stats.tasks.total}`);
  console.log(`  已完成: ${colorize(stats.tasks.completed, 'green')}`);
  console.log(`  进行中: ${colorize(stats.tasks.inProgress, 'yellow')}`);
  console.log(`  待处理: ${colorize(stats.tasks.pending, 'red')}`);
  console.log(`  受阻: ${colorize(stats.tasks.blocked, 'red')}\n`);
  
  console.log(`${colorize('整体进度:', 'bright')} ${colorize(`${stats.progress}%`, 'cyan')}`);
  
  if (stats.velocity) {
    console.log(`\n${colorize('团队速度:', 'bright')}`);
    console.log(`  估算准确率: ${stats.velocity.accuracy}%`);
    console.log(`  平均工时/任务: ${stats.velocity.averageHoursPerTask}小时`);
  }
}

// 生成报告
function generateReport() {
  const report = taskManager.generateReport();
  
  console.log(`\n${colorize('MovieWrite项目报告', 'bright')}`);
  console.log(`生成时间: ${format(new Date(report.generatedAt), 'yyyy-MM-dd HH:mm:ss')}\n`);
  
  console.log(colorize('项目概要:', 'cyan'));
  console.log(`  整体进度: ${colorize(report.summary.overallProgress, 'green')}`);
  console.log(`  Epic完成: ${report.summary.epicsCompleted}`);
  console.log(`  Story完成: ${report.summary.storiesCompleted}`);
  console.log(`  Task完成: ${report.summary.tasksCompleted}\n`);
  
  if (report.activeWork.inProgressEpics.length > 0) {
    console.log(colorize('进行中的Epic:', 'cyan'));
    report.activeWork.inProgressEpics.forEach(epic => {
      console.log(`  - ${epic.id}: ${epic.title}`);
    });
    console.log();
  }
  
  if (report.activeWork.inProgressTasks.length > 0) {
    console.log(colorize('进行中的任务:', 'cyan'));
    report.activeWork.inProgressTasks.forEach(task => {
      console.log(`  - ${task.id}: ${task.title} (${task.assignee || '未分配'}) ${task.progress}`);
    });
    console.log();
  }
  
  if (report.blockedItems.length > 0) {
    console.log(colorize('受阻的任务:', 'red'));
    report.blockedItems.forEach(item => {
      console.log(`  - ${item.id}: ${item.title}`);
      item.blockedBy.forEach(dep => {
        console.log(`    被阻塞于: ${dep.id} - ${dep.title}`);
      });
    });
  }
}

// 初始化项目任务
function initializeTasks() {
  console.log(colorize('初始化MovieWrite转型项目任务...', 'cyan'));
  
  // 创建Epic 1
  const epic1 = taskManager.createEpic({
    id: 'MWT-E001',
    title: '智能合约升级',
    priority: 'high',
    estimatedWeeks: 4
  });
  
  // 创建Story 1.1
  const story1_1 = taskManager.createStory({
    id: 'MWT-S001',
    epicId: 'MWT-E001',
    title: '个人文章NFT合约',
    priority: 'high'
  });
  
  // 创建示例任务
  taskManager.createTask({
    id: 'MWT-T001',
    storyId: 'MWT-S001',
    title: '设计ArticleNFT合约架构',
    description: '设计支持ERC721标准的文章NFT合约',
    estimatedHours: 8,
    priority: 'high'
  });
  
  taskManager.createTask({
    id: 'MWT-T002',
    storyId: 'MWT-S001',
    title: '实现ERC721标准功能',
    description: '实现mint、transfer等基础NFT功能',
    estimatedHours: 16,
    priority: 'high',
    dependencies: ['MWT-T001']
  });
  
  console.log(colorize('✓ 项目任务初始化完成！', 'green'));
  console.log('\n运行 "node scripts/task-cli.js status" 查看项目状态');
}

// 列出任务
function listTasks(type, filterStatus) {
  let items = [];
  let title = '';
  
  switch (type) {
    case 'epics':
      items = Object.values(taskManager.tasks.epics);
      title = 'Epics';
      break;
    case 'stories':
      items = Object.values(taskManager.tasks.stories);
      title = 'Stories';
      break;
    case 'tasks':
      items = Object.values(taskManager.tasks.tasks);
      title = 'Tasks';
      break;
    default:
      console.log(colorize('错误: 无效的类型', 'red'));
      return;
  }
  
  if (filterStatus) {
    items = items.filter(item => item.status === filterStatus);
  }
  
  console.log(`\n${colorize(title + '列表:', 'bright')}\n`);
  
  if (items.length === 0) {
    console.log('  没有找到匹配的项目');
    return;
  }
  
  items.forEach(item => {
    const statusColor = item.status === 'completed' ? 'green' : 
                       item.status === 'in-progress' ? 'yellow' : 'red';
    
    console.log(`${item.id}: ${item.title}`);
    console.log(`  状态: ${colorize(item.status, statusColor)}`);
    console.log(`  优先级: ${item.priority}`);
    
    if (item.assignee) {
      console.log(`  负责人: ${item.assignee}`);
    }
    
    if (item.progress !== undefined) {
      console.log(`  进度: ${item.progress}%`);
    }
    
    console.log();
  });
}

// 主程序
function main() {
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  switch (command) {
    case 'status':
      showStatus();
      break;
      
    case 'report':
      generateReport();
      break;
      
    case 'init':
      initializeTasks();
      break;
      
    case 'list':
      const statusFilter = args.find(arg => arg.startsWith('--status='))?.split('=')[1];
      listTasks(subcommand, statusFilter);
      break;
      
    case 'create':
      console.log(colorize('创建功能需要通过API或Web界面使用', 'yellow'));
      break;
      
    case 'update':
      console.log(colorize('更新功能需要通过API或Web界面使用', 'yellow'));
      break;
      
    default:
      console.log(colorize(`错误: 未知命令 '${command}'`, 'red'));
      showHelp();
  }
}

// 运行主程序
main();