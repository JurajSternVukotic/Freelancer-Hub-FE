import api from './api'
import { clientApi } from './clientApi'

export interface ProjectPhase {
  name: string
  duration: string
  deliverables: string[]
  description?: string
}

export interface ProjectPhaseSuggestion {
  phases: ProjectPhase[]
  estimatedDuration: string
  recommendations: string[]
}

export interface SuggestPhasesData {
  projectDescription: string
  projectType?: string
  budget?: number
  timeline?: string
}

export interface GenerateDescriptionData {
  userPrompt: string
  projectTitle?: string
  budgetRange?: string
  priority?: string
  deadline?: string
}

class AiService {
  async suggestProjectPhases(data: SuggestPhasesData): Promise<ProjectPhaseSuggestion> {
    const response = await api.post('/ai/suggest-phases', data)
    return response.data.data
  }

  async generateProjectDescription(data: GenerateDescriptionData): Promise<string> {
    const response = await api.post('/ai/generate-description', data)
    return response.data.data.description
  }

  async generateProjectDescriptionForClient(data: GenerateDescriptionData): Promise<string> {
    const response = await clientApi.post('/client-portal/ai/generate-description', data)
    return response.data.data.description
  }

  getProjectTypeIcon(type?: string): string {
    const icons: { [key: string]: string } = {
      'web': '🌐',
      'mobile': '📱',
      'design': '🎨',
      'marketing': '📈',
      'consulting': '💼'
    }
    return icons[type?.toLowerCase() || 'web'] || '💻'
  }

  getProjectTypeColor(type?: string): string {
    const colors: { [key: string]: string } = {
      'web': 'bg-blue-100 text-blue-800',
      'mobile': 'bg-green-100 text-green-800',
      'design': 'bg-purple-100 text-purple-800',
      'marketing': 'bg-orange-100 text-orange-800',
      'consulting': 'bg-indigo-100 text-indigo-800'
    }
    return colors[type?.toLowerCase() || 'web'] || 'bg-gray-100 text-gray-800'
  }

  formatDuration(duration: string): string {

    return duration
      .replace(/week/gi, 'tjedan')
      .replace(/weeks/gi, 'tjedana')
      .replace(/day/gi, 'dan')
      .replace(/days/gi, 'dana')
      .replace(/month/gi, 'mjesec')
      .replace(/months/gi, 'mjeseca')
      .replace(/hour/gi, 'sat')
      .replace(/hours/gi, 'sati')
  }
}

export default new AiService()