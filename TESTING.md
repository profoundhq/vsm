# VSM Builder - Testing Guide

## Automated Testing

### Run the Test Script

```bash
node test-vsm-store.js
```

This tests all core VSM functionality:
- ✅ Stream creation
- ✅ Activity management (backward mapping)
- ✅ Timing data
- ✅ Dimensions tracking
- ✅ Constraint identification
- ✅ Chat messaging
- ✅ Workflow progression

## Build Verification

### Production Build

```bash
npm run build
```

Verify that:
- Build completes without errors
- Output is generated in `.svelte-kit/output/`
- Client and server bundles are created

### Preview Production Build

```bash
npm run preview
```

Access at http://localhost:4173

## Manual Testing (When Web Interface is Available)

### Step 1: Stream Selection
```
Input: "Customer Order Fulfillment"
Expected: Assistant confirms stream and moves to add-activities step
```

### Step 2: Add Activities (Working Backwards)
```
Input (in order):
1. "Delivery to Customer"
2. "Package Order"
3. "Pick Items from Warehouse"
4. "Process Payment"
5. "Receive Order"
6. "done"

Expected:
- Each activity is added to the flow diagram
- Activities appear from right (end) to left (start)
- Assistant prompts for next activity until "done"
```

### Step 3: Add Timing
```
Input:
- "activity Delivery process 30 lead 120"
- "activity Package process 15 lead 30"
- "activity Pick process 20 lead 45"
- "done"

Expected:
- Each activity node shows timing data
- Process time and lead time displayed in node
```

### Step 4: Add Dimensions
```
Input:
- "activity Package value 85 defect 5 changeover 5"
- "activity Pick value 90 defect 3 changeover 10"
- "done"

Expected:
- Dimensions displayed in activity nodes
- Blue background section for dimension data
```

### Step 5: Highlight Constraint
```
Input: "Package Order"

Expected:
- "Package Order" node highlights with red border
- Constraint badge (⚠️) appears on node
- Background changes to light red
```

## Component Testing

### VSMNode Component
**What it does:** Displays individual activity nodes with all their data

**Key features to verify:**
- Activity name displays correctly
- Timing data shows when present
- Dimensions render in separate section
- Constraint styling applies when flagged
- Handles connect source and target positions

### ChatInterface Component
**What it does:** Manages user interaction and workflow

**Key features to verify:**
- Messages display in correct order
- User vs Assistant messages styled differently
- Input accepts text and submits on Enter
- Step indicator shows current workflow step
- Auto-scrolls to latest message

### VSMFlow Component
**What it does:** Renders the flow diagram with activities

**Key features to verify:**
- Activities positioned left-to-right (backward flow)
- Edges connect activities correctly
- Empty state shows when no activities
- MiniMap and Controls render
- Nodes update when store changes

## File Structure Verification

```bash
# Check all source files exist
ls -R src/

# Expected structure:
# src/
# ├── app.css
# ├── app.html
# ├── lib/
# │   ├── components/
# │   │   ├── ChatInterface.svelte
# │   │   ├── VSMFlow.svelte
# │   │   └── VSMNode.svelte
# │   ├── stores/
# │   │   └── vsmStore.ts
# │   └── types/
# │       └── vsm.ts
# └── routes/
#     ├── +layout.svelte
#     └── +page.svelte
```

## Type Checking

```bash
npm run check
```

Verifies TypeScript types are correct across the application.

## Quick Functionality Checklist

- [ ] Application builds successfully
- [ ] Store management works (stream, activities, timing, dimensions, constraints)
- [ ] Chat workflow progresses through all 5 steps
- [ ] Activities are stored in backward order (end to start)
- [ ] Timing data persists and displays
- [ ] Dimensions track correctly
- [ ] Constraint highlighting functions
- [ ] Messages persist in chat history
- [ ] Step indicator updates correctly

## Test Results

Last test run: All tests passed ✅

```
✓ Stream: Order Fulfillment
✓ Activities: 4
✓ Messages: 2
✓ Current step: highlight-constraint
✓ Constraint identified: Package Order
```
