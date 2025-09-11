import type { Task, TaskPriority } from '../services/taskService'

export interface UrgencyCalculation {
  urgencyScore: number
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low'
  urgencyHeight: number // CSS height multiplier (1x to 3x)
  description: string
}

export function calculateTaskUrgency(task: Task): UrgencyCalculation {

  const priorityWeights: Record<TaskPriority, number> = {
    'URGENT': 4,
    'HIGH': 3,
    'MEDIUM': 2,
    'LOW': 1
  }

  const priorityScore = priorityWeights[task.priority] || 2

  let dateScore = 1
  let dateDescription = ''
  
  if (task.dueDate) {
    const now = new Date()
    const dueDate = new Date(task.dueDate)
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue < 0) {
      const daysOverdue = Math.abs(daysUntilDue)
      dateScore = 5
      dateDescription = `${daysOverdue} dan${daysOverdue === 1 ? '' : 'a'} u kašnjenju`
    } else if (daysUntilDue === 0) {
      dateScore = 4
      dateDescription = 'Dospijeće danas'
    } else if (daysUntilDue === 1) {
      dateScore = 3.5
      dateDescription = 'Dospijeće sutra'
    } else if (daysUntilDue <= 3) {
      dateScore = 3
      dateDescription = `Dospijeće za ${daysUntilDue} dana`
    } else if (daysUntilDue <= 7) {
      dateScore = 2.5
      dateDescription = 'Dospijeće ovaj tjedan'
    } else if (daysUntilDue <= 14) {
      dateScore = 2
      dateDescription = 'Dospijeće sljedeći tjedan'
    } else {
      dateScore = 1
      dateDescription = `Dospijeće za ${daysUntilDue} dana`
    }
  } else {
    dateDescription = 'Nema rok'
  }

  const urgencyScore = Math.round(priorityScore * dateScore)

  let urgencyLevel: UrgencyCalculation['urgencyLevel']
  let urgencyHeight: number
  
  if (urgencyScore >= 15) {
    urgencyLevel = 'critical'
    urgencyHeight = 3 // 3x height
  } else if (urgencyScore >= 10) {
    urgencyLevel = 'high'
    urgencyHeight = 2.2 // 2.2x height
  } else if (urgencyScore >= 6) {
    urgencyLevel = 'medium'
    urgencyHeight = 1.6 // 1.6x height
  } else {
    urgencyLevel = 'low'
    urgencyHeight = 1 // Normal height
  }

  const priorityLabel = {
    'URGENT': 'Hitno',
    'HIGH': 'Visoko',
    'MEDIUM': 'Srednje',
    'LOW': 'Nisko'
  }[task.priority]

  const description = dateDescription 
    ? `${priorityLabel} prioritet • ${dateDescription}` 
    : `${priorityLabel} prioritet`

  return {
    urgencyScore,
    urgencyLevel,
    urgencyHeight,
    description
  }
}

export function getUrgencyClasses(urgency: UrgencyCalculation): string[] {
  const classes = [`urgency-${urgency.urgencyLevel}`]
  
  if (urgency.urgencyLevel === 'critical') {
    classes.push('urgency-pulse') // Add pulsing animation for critical tasks
  }
  
  return classes
}

export function sortTasksByUrgency(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const urgencyA = calculateTaskUrgency(a)
    const urgencyB = calculateTaskUrgency(b)

    if (urgencyA.urgencyScore !== urgencyB.urgencyScore) {
      return urgencyB.urgencyScore - urgencyA.urgencyScore
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}