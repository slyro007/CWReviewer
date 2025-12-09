import type { EmployeeMetrics, PerformanceRating, ConnectWiseNote } from '../types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface AIAnalysisResult {
  insights: string[];
  recommendations: string[];
  summary: string;
}

class AIService {
  private async callOpenAI(
    prompt: string,
    systemPrompt?: string
  ): Promise<string> {
    if (!OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured');
      return '';
    }

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000, // Increased for comprehensive analysis
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      return '';
    }
  }

  async analyzeEmployeePerformance(metrics: EmployeeMetrics): Promise<AIAnalysisResult> {
    const allProjects = metrics.projects
      .sort((a, b) => b.totalHours - a.totalHours)
      .map((p) => `- ${p.projectName}: ${p.totalHours.toFixed(1)} hours (${p.entries.length} entries)`)
      .join('\n');

    const recentTimeEntries = metrics.timeEntries
      .sort((a, b) => new Date(b.timeStart).getTime() - new Date(a.timeStart).getTime())
      .slice(0, 50)
      .map((e) => `- ${e.timeStart.split('T')[0]}: ${e.actualHours?.toFixed(2) || '0'}h - Ticket: ${e.ticketId || 'N/A'} - ${(e.notes || '').substring(0, 100)}`)
      .join('\n');

    const prompt = `Analyze the following COMPLETE employee performance metrics and provide comprehensive insights:

Employee: ${metrics.memberName}
Total Hours: ${metrics.totalHours.toFixed(1)}
Total Projects: ${metrics.totalProjects}
Total Tickets: ${metrics.totalTickets}
Average Note Quality: ${metrics.averageNoteQuality.toFixed(0)}/100
Total Time Entries: ${metrics.timeEntries.length}

ALL Projects (${metrics.projects.length} total):
${allProjects}

Recent Time Entries (showing 50 most recent):
${recentTimeEntries}

Provide:
1. 5-7 key insights about their performance (be specific and data-driven)
2. 5-7 actionable recommendations (be concrete and measurable)
3. A comprehensive summary (3-4 sentences covering overall performance, strengths, and areas for growth)

Format as JSON with keys: insights (array), recommendations (array), summary (string)`;

    const systemPrompt =
      'You are an expert HR analyst. Provide professional, constructive feedback based on data. Be specific and actionable.';

    const response = await this.callOpenAI(prompt, systemPrompt);
    
    try {
      return JSON.parse(response);
    } catch {
      // Fallback if JSON parsing fails
      return {
        insights: ['AI analysis temporarily unavailable'],
        recommendations: ['Review metrics manually'],
        summary: 'Unable to generate AI analysis at this time.',
      };
    }
  }

  async generatePerformanceRatings(metrics: EmployeeMetrics): Promise<PerformanceRating[]> {
    const allProjects = metrics.projects
      .sort((a, b) => b.totalHours - a.totalHours)
      .map((p) => `- ${p.projectName}: ${p.totalHours.toFixed(1)} hours, ${p.entries.length} entries`)
      .join('\n');

    const timeEntrySummary = metrics.timeEntries
      .reduce((acc, e) => {
        const date = e.timeStart.split('T')[0];
        acc[date] = (acc[date] || 0) + (e.actualHours || 0);
        return acc;
      }, {} as Record<string, number>);

    const daysWorked = Object.keys(timeEntrySummary).length;
    const avgHoursPerDay = daysWorked > 0 ? metrics.totalHours / daysWorked : 0;

    const prompt = `Based on these COMPLETE metrics, rate the employee on 7 criteria (1-4 scale, where 1=Needs Work, 2=Meets Expectations, 3=Good, 4=Exceeds Expectations):

Employee: ${metrics.memberName}
Total Hours: ${metrics.totalHours.toFixed(1)}
Total Projects: ${metrics.totalProjects}
Total Tickets: ${metrics.totalTickets}
Average Note Quality: ${metrics.averageNoteQuality.toFixed(0)}/100
Total Time Entries: ${metrics.timeEntries.length}
Days Worked: ${daysWorked}
Average Hours per Day: ${avgHoursPerDay.toFixed(2)}

ALL Projects:
${allProjects}

Rate these criteria:
1. Job Knowledge (Possesses the knowledge to perform the job proficiently)
2. Productivity (Amount of work consistently produced)
3. Quality of Work (Accuracy, Thoroughness, attention to detail and completeness)
4. Team Skills (Contributes to the team with a positive attitude, accepts responsibility, participates in team projects)
5. Career Development (Effort to improve knowledge and skills in IT that add value to organization/individual)
6. Continuous Improvement (Finds new and better ways of doing things and advocates for them)
7. Attendance (Works scheduled days and hours)

For each criterion, provide:
- score: number (1-4)
- rating: string ("Needs Work" | "Meets Expectations" | "Good" | "Exceeds Expectations")
- evidence: array of 2-3 specific evidence points

Return as JSON array with objects containing: criterion, score, rating, evidence.`;

    const systemPrompt =
      'You are a fair performance reviewer. Base ratings strictly on the provided metrics. Be objective and evidence-based.';

    const response = await this.callOpenAI(prompt, systemPrompt);
    
    try {
      return JSON.parse(response);
    } catch {
      // Return default ratings if AI fails
      return [];
    }
  }

  async generateAccomplishments(metrics: EmployeeMetrics): Promise<string[]> {
    const allProjects = metrics.projects
      .sort((a, b) => b.totalHours - a.totalHours)
      .map((p) => `- ${p.projectName}: ${p.totalHours.toFixed(1)} hours, ${p.entries.length} entries`)
      .join('\n');

    const highImpactProjects = metrics.projects
      .filter(p => p.totalHours > 20)
      .map(p => p.projectName)
      .join(', ');

    const prompt = `Generate 7-10 professional accomplishment statements for this employee based on their COMPLETE work history:

Employee: ${metrics.memberName}
Total Hours: ${metrics.totalHours.toFixed(1)}
Total Projects: ${metrics.totalProjects}
Total Tickets: ${metrics.totalTickets}
Average Note Quality: ${metrics.averageNoteQuality.toFixed(0)}/100
Total Time Entries: ${metrics.timeEntries.length}

ALL Projects:
${allProjects}

High-Impact Projects (>20 hours): ${highImpactProjects || 'None'}

Write accomplishment statements that:
- Are specific and quantifiable with actual numbers
- Highlight impact and value to the organization
- Use professional, review-appropriate language
- Cover different aspects: projects, tickets, quality, consistency, growth
- Are suitable for a performance review

Return as JSON array of strings.`;

    const systemPrompt =
      'You are writing professional accomplishment statements for a performance review. Be specific, positive, and data-driven.';

    const response = await this.callOpenAI(prompt, systemPrompt);
    
    try {
      return JSON.parse(response);
    } catch {
      return [];
    }
  }

  async generateGoals(metrics: EmployeeMetrics): Promise<string[]> {
    const allProjects = metrics.projects
      .sort((a, b) => b.totalHours - a.totalHours)
      .map((p) => `- ${p.projectName}: ${p.totalHours.toFixed(1)} hours`)
      .join('\n');

    const avgHoursPerEntry = metrics.timeEntries.length > 0
      ? metrics.totalHours / metrics.timeEntries.length
      : 0;

    const prompt = `Based on this employee's COMPLETE current performance, suggest 7-10 SMART goals for their next review period:

Current Performance:
- Total Hours: ${metrics.totalHours.toFixed(1)}
- Total Projects: ${metrics.totalProjects}
- Average Note Quality: ${metrics.averageNoteQuality.toFixed(0)}/100
- Total Tickets: ${metrics.totalTickets}
- Total Time Entries: ${metrics.timeEntries.length}
- Average Hours per Entry: ${avgHoursPerEntry.toFixed(2)}

All Projects:
${allProjects}

Areas to consider (be specific based on the data):
${metrics.averageNoteQuality < 70 ? `- Note quality (${metrics.averageNoteQuality.toFixed(0)}/100) needs improvement to reach 75+\n` : ''}
${metrics.totalProjects < 15 ? `- Project portfolio (${metrics.totalProjects} projects) could be expanded\n` : ''}
${avgHoursPerEntry < 1 ? `- Efficiency (${avgHoursPerEntry.toFixed(2)}h/entry) could be improved\n` : ''}
- Professional development and skill expansion
- Quality and attention to detail
- Collaboration and team contribution
- Consistency and reliability

Return as JSON array of SMART goal statements (strings). Each goal should be Specific, Measurable, Achievable, Relevant, and Time-bound.`;

    const systemPrompt =
      'You are a career development advisor. Suggest realistic, achievable goals that build on strengths and address growth areas.';

    const response = await this.callOpenAI(prompt, systemPrompt);
    
    try {
      return JSON.parse(response);
    } catch {
      return [];
    }
  }

  async analyzeNoteQuality(note: ConnectWiseNote): Promise<{
    strengths: string[];
    improvements: string[];
    overallAssessment: string;
  }> {
    const fullNoteText = note.text || '';
    
    const prompt = `Analyze this COMPLETE technical note and provide comprehensive feedback:

Full Note Text: "${fullNoteText}"
Note Date: ${note.dateCreated}
Ticket ID: ${note.ticketId || 'N/A'}
Project ID: ${note.projectId || 'N/A'}
Internal: ${note.internalFlag ? 'Yes' : 'No'}

Provide:
1. 3-5 specific strengths of the note (detail, clarity, technical accuracy, structure, completeness)
2. 3-5 specific areas for improvement (be constructive and actionable)
3. Overall assessment (2-3 sentences covering quality, usefulness, and professionalism)

Return as JSON with keys: strengths (array), improvements (array), overallAssessment (string)`;

    const systemPrompt =
      'You are a technical documentation expert. Provide constructive feedback on note quality, clarity, and completeness.';

    const response = await this.callOpenAI(prompt, systemPrompt);
    
    try {
      return JSON.parse(response);
    } catch {
      return {
        strengths: [],
        improvements: [],
        overallAssessment: 'Unable to analyze note at this time.',
      };
    }
  }

  async generateFeedback(
    type: 'company' | 'leadership' | 'team',
    metrics: EmployeeMetrics
  ): Promise<string> {
    const allProjects = metrics.projects
      .map((p) => `${p.projectName} (${p.totalHours.toFixed(1)}h)`)
      .join(', ');

    const prompts = {
      company: `Based on COMPLETE work experience: ${metrics.totalHours.toFixed(1)} hours across ${metrics.totalProjects} projects and ${metrics.totalTickets} tickets, write 3-4 comprehensive, professional sentences about how the company is performing. Include specific observations about: project management, communication, support structure, work environment, and overall effectiveness. Be constructive, honest, and professional.`,
      leadership: `Based on COMPLETE experience working on ${metrics.totalProjects} projects (${allProjects}), write 3-4 comprehensive, professional sentences providing feedback to leadership. Include: appreciation for specific support received, observations about leadership effectiveness, and constructive suggestions for improvement. Be diplomatic, specific, and professional.`,
      team: `Based on COMPLETE collaboration experience across ${metrics.totalProjects} projects (${allProjects}), write 3-4 comprehensive, professional sentences about team performance. Include: strengths observed, collaboration effectiveness, areas for continued focus, and overall team dynamics. Be positive, constructive, and specific.`,
    };

    const systemPrompt =
      'You are writing professional feedback for a performance review. Be diplomatic, constructive, and professional.';

    return await this.callOpenAI(prompts[type], systemPrompt);
  }

  async generateHighlights(metrics: EmployeeMetrics): Promise<{
    standoutAchievements: string[];
    areasForAttention: string[];
    summary: string;
  }> {
    const allProjects = metrics.projects
      .sort((a, b) => b.totalHours - a.totalHours)
      .map((p) => `${p.projectName}: ${p.totalHours.toFixed(1)}h (${p.entries.length} entries)`)
      .join('\n');

    const timeDistribution = metrics.timeEntries.reduce((acc, e) => {
      const month = new Date(e.timeStart).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      acc[month] = (acc[month] || 0) + (e.actualHours || 0);
      return acc;
    }, {} as Record<string, number>);

    const prompt = `Analyze this employee's COMPLETE performance and identify what stands out:

COMPLETE Metrics:
- Total Hours: ${metrics.totalHours.toFixed(1)}
- Total Projects: ${metrics.totalProjects}
- Total Tickets: ${metrics.totalTickets}
- Average Note Quality: ${metrics.averageNoteQuality.toFixed(0)}/100
- Total Time Entries: ${metrics.timeEntries.length}

ALL Projects:
${allProjects}

Monthly Hours Distribution:
${Object.entries(timeDistribution)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([month, hours]) => `${month}: ${hours.toFixed(1)}h`)
  .join('\n')}

Provide:
1. 5-7 standout achievements or positive highlights (be specific with numbers and examples)
2. 3-5 areas that need attention or improvement (be constructive and specific)
3. A comprehensive summary (3-4 sentences) covering overall performance, key strengths, and growth trajectory

Return as JSON with keys: standoutAchievements (array), areasForAttention (array), summary (string)`;

    const systemPrompt =
      'You are an expert performance analyst. Identify key highlights and areas for improvement based on data.';

    const response = await this.callOpenAI(prompt, systemPrompt);
    
    try {
      return JSON.parse(response);
    } catch {
      return {
        standoutAchievements: [],
        areasForAttention: [],
        summary: 'Unable to generate highlights at this time.',
      };
    }
  }
}

export const aiService = new AIService();

