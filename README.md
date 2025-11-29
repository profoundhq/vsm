# VSM Builder

A Value Stream Mapping application built with SvelteKit and Svelte Flow that helps you create value stream maps working backwards from the end.

## Features

- 📊 **Interactive Flow Diagram** - Visualize your value stream with Svelte Flow
- 💬 **Chat-Based Interface** - Build your VSM through conversational prompts
- ⏪ **Backward Mapping** - Start from the end and work backwards through your process
- ⚡ **Real-time Updates** - See your map update as you add information
- 📏 **Complete VSM Data** - Track timing, dimensions, and constraints

## Workflow Steps

The application guides you through 5 key steps:

1. **Stream Selection** - Define what value stream you want to map
2. **Add Activities** - Add activities working backwards from the final step
3. **Add Timing** - Include process time and lead time for each activity
4. **Add Dimensions** - Add value-add percentage, defect rates, and changeover times
5. **Highlight Constraint** - Identify the bottleneck in your process

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

### Chat Commands

#### Step 1: Stream Selection
Simply type the name of your stream:
```
Customer Order Fulfillment
```

#### Step 2: Add Activities
Add activities one at a time, starting from the END:
```
Delivery to Customer
Package Order
Pick Items
Process Payment
```
Type `done` when finished.

#### Step 3: Add Timing
Add timing data for each activity:
```
activity Delivery process 30 lead 120
activity Package process 15 lead 30
```
Type `done` when finished.

#### Step 4: Add Dimensions
Add quality and efficiency metrics:
```
activity Delivery value 90 defect 2 changeover 10
activity Package value 85 defect 5 changeover 5
```
Type `done` when finished.

#### Step 5: Highlight Constraint
Identify the bottleneck:
```
Package Order
```

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ChatInterface.svelte   # Chat UI and workflow logic
│   │   ├── VSMFlow.svelte          # Svelte Flow integration
│   │   └── VSMNode.svelte          # Custom node component
│   ├── stores/
│   │   └── vsmStore.ts             # State management
│   └── types/
│       └── vsm.ts                  # TypeScript types
├── routes/
│   ├── +layout.svelte              # Root layout
│   └── +page.svelte                # Main application page
├── app.html                        # HTML template
└── app.css                         # Global styles
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
