# ConnectWise Analytics Dashboard

A modern, AI-powered web application for comprehensive employee performance analytics from ConnectWise Manage data. Features time tracking, project contributions, note quality assessment, comparative analysis, and AI-assisted performance reviews.

## Features

### 📊 Core Analytics
- **Time Tracking Analysis**: View time entries grouped by board, ticket, and date with interactive charts
- **Project Contributions**: Complete breakdown of all projects with hours per project
- **Notes Quality Assessment**: Automated scoring with manual review interface
- **Comparative Analysis**: Compare multiple employees side-by-side
- **Trends Over Time**: Visualize performance trends with time series charts
- **Highlights Panel**: "What stood out" insights and achievements

### 🤖 AI-Powered Features
- **Performance Ratings**: AI-generated ratings for 7 performance criteria with evidence
- **Accomplishments Generator**: AI-powered accomplishment statements for reviews
- **Goals Generator**: SMART goals suggestions based on performance data
- **Feedback Helper**: AI-assisted feedback for company, leadership, and team
- **Comprehensive Analysis**: Full data analysis without truncation

### 📤 Export Capabilities
- **Multiple Formats**: Export to PDF, Excel/CSV, Word, or JSON
- **Customizable Sections**: Choose what to include in exports
- **Complete Data**: All time entries, projects, notes, and metrics

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom glass morphism design
- **Animations**: Framer Motion
- **Charts**: Recharts
- **AI**: OpenAI GPT-4o-mini
- **PDF Export**: jsPDF
- **Icons**: Lucide React

## Setup

### Prerequisites
- Node.js 18+ and npm
- ConnectWise Manage API credentials
- OpenAI API key (optional, for AI features)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd CWReviewer
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_CW_CLIENT_ID=your-client-id
VITE_CW_PUBLIC_KEY=your-public-key
VITE_CW_PRIVATE_KEY=your-private-key
VITE_CW_BASE_URL=https://na.myconnectwise.net
VITE_CW_COMPANY_ID=wolfflogics
VITE_OPENAI_API_KEY=your-openai-api-key
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

## ConnectWise API Setup

1. In ConnectWise Manage, navigate to **System > Members**
2. Select the **API Members** tab
3. Create a new API Member with appropriate permissions
4. Generate API Keys (Public Key and Private Key)
5. Note your Client ID from the API configuration

## Usage

1. **Select Employee(s)**: Use the searchable employee selector
2. **View Metrics**: Navigate through different views using the sidebar
3. **AI Analysis**: Toggle AI enhancement for deeper insights
4. **Export Data**: Use the Export view to download comprehensive reports
5. **Performance Reviews**: Use the Performance Review assistant to generate review content

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── EmployeeSelector.tsx
│   ├── MetricsOverview.tsx
│   ├── TimeTrackingView.tsx
│   ├── ProjectContributions.tsx
│   ├── NotesReview.tsx
│   ├── ComparisonView.tsx
│   ├── TrendsView.tsx
│   ├── HighlightsPanel.tsx
│   ├── PerformanceReview.tsx
│   └── WorkExport.tsx
├── services/           # API and business logic
│   ├── connectwiseService.ts
│   ├── noteQualityService.ts
│   └── aiService.ts
├── types/             # TypeScript interfaces
├── utils/             # Helper functions
└── config/            # Configuration
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CW_CLIENT_ID` | ConnectWise API Client ID | Yes |
| `VITE_CW_PUBLIC_KEY` | ConnectWise API Public Key | Yes |
| `VITE_CW_PRIVATE_KEY` | ConnectWise API Private Key | Yes |
| `VITE_CW_BASE_URL` | ConnectWise instance URL | Yes |
| `VITE_CW_COMPANY_ID` | ConnectWise company ID | Yes |
| `VITE_OPENAI_API_KEY` | OpenAI API key for AI features | Optional |

## Security Notes

- **Never commit** `.env` files or API keys to version control
- The `.gitignore` file is configured to exclude sensitive files
- API keys are only used client-side for API calls
- Consider using environment-specific configurations for production

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Features in Detail

### Time Tracking
- View all time entries with filtering
- Group by board, ticket, or date
- Interactive charts and visualizations
- Export time data

### Project Contributions
- Complete list of all projects
- Hours breakdown per project
- Project details and status
- Sortable and filterable

### Notes Quality
- Automated quality scoring (0-100)
- Manual review and rating system
- Filter by quality score
- Full note text analysis

### AI Analysis
- Comprehensive performance analysis
- Data-driven insights and recommendations
- Professional review content generation
- No data truncation - full analysis

### Export Options
- PDF reports with formatting
- Excel/CSV for data analysis
- Word documents for editing
- JSON for programmatic access

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For issues or questions, please contact the development team.

---

Built with ❤️ using React, TypeScript, and AI

