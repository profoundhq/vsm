# Throughline

A Value Stream Mapping application built with SvelteKit and Svelte Flow that helps you create value stream maps working backwards from the end.

## Features

- 📊 **Interactive Flow Diagram** - Visualize your value stream with Svelte Flow
- ⏪ **Backward Mapping** - Start from the end and work backwards through your process
- ⚡ **Real-time Updates** - See your map update as you add information
- 📏 **Complete VSM Data** - Track timing, dimensions, and constraints
- 📤 **Export Options** - Export as CSV, YAML, PNG, or PDF

## Workflow

1. **Create or Select Stream** - Use the stream selector or "+ Add Stream" button to create/switch between value streams
2. **Add Activities** - Click "+ Add Activity" to add activities working backwards from the final step
3. **Edit Activity Details** - Click any activity node to add timing, dimensions, and metrics
4. **Rearrange Flow** - Use edit mode to reorder activities or insert new ones between existing steps
5. **Mark Constraints** - Identify bottlenecks in your activity details
6. **Export** - Save your VSM as CSV, YAML, PNG, or PDF

## Installation

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
npm run preview
```

## Deployment

### GitHub Pages

This app is configured for automatic deployment to GitHub Pages:

1. Enable GitHub Pages in repository settings (Settings > Pages)
2. Set source to "GitHub Actions"
3. Push to main branch

The site will be available at: `https://<username>.github.io/<repository-name>/`

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Other Platforms

The static build output in the `build` folder can be deployed to any static hosting service (Vercel, Netlify, Cloudflare Pages, etc.)

## Testing

Since the web interface may not be accessible in all environments, you can test the core functionality:

### Run Automated Tests

```bash
node test-vsm-store.js
```

This validates:
- ✅ Stream creation and management
- ✅ Activity handling (backward mapping)
- ✅ Timing and dimension data
- ✅ Constraint identification
- ✅ Chat workflow progression

### Verify Production Build

```bash
npm run build
```

For detailed testing instructions, see [TESTING.md](./TESTING.md)

## Usage

### Creating Your Value Stream Map

1. **Create a Stream**
   - Click "+ Add Stream" button in the toolbar
   - Enter a stream name (e.g., "Customer Order Fulfillment")

2. **Add Activities** (Work backwards from the end)
   - Click "+ Add Activity" button
   - Enter activity name (e.g., "Delivery to Customer")
   - Continue adding activities in reverse order

3. **Add Details to Activities**
   - Click any activity node to open the edit modal
   - Add timing data: Process time and lead time
   - Add dimensions: Value-add %, defect rate, changeover time
   - Add metrics: Complete/accurate %, uptime %, operators, batch size
   - Mark as constraint if it's a bottleneck

4. **Rearrange Activities**
   - Click the pencil icon in the flow controls to enable edit mode
   - Use arrow buttons to move activities left or right
   - Use + button to insert new activities between existing ones

5. **Export Your Map**
   - Open the menu (hamburger icon)
   - Choose from CSV, YAML, PNG, or PDF export options

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── VSMFlow.svelte           # Svelte Flow integration
│   │   ├── VSMNode.svelte           # Custom node component
│   │   ├── NodeToolbar.svelte       # Stream/activity creation toolbar
│   │   ├── StreamManager.svelte     # Stream selector dropdown
│   │   ├── ActivityEditModal.svelte # Activity details editor
│   │   ├── SidebarMenu.svelte       # Main menu sidebar
│   │   └── ...                      # Export/import components
│   ├── stores/
│   │   ├── vsmStore.ts              # VSM data state management
│   │   └── uiStore.ts               # UI state management
│   └── types/
│       └── vsm.ts                   # TypeScript types
├── routes/
│   ├── +layout.svelte               # Root layout
│   └── +page.svelte                 # Main application page
├── app.html                         # HTML template
└── app.css                          # Global styles
```

## Technologies

- **SvelteKit** - Application framework
- **Svelte Flow** (@xyflow/svelte) - Flow diagram visualization
- **TypeScript** - Type safety
- **Vite** - Build tool

## Key Concepts

### Backward Mapping
The app encourages working backwards from the end of your value stream. This approach helps you:
- Focus on customer-facing outcomes first
- Identify dependencies more clearly
- Spot unnecessary steps

### VSM Components
Each activity node displays:
- **Activity Name** - What happens in this step
- **Timing Data** - Process time and lead time
- **Dimensions** - Value-add %, defect rate, changeover time
- **Constraint Badge** - Visual indicator for bottlenecks

## License

MIT
