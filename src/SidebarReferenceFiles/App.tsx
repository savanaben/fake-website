import React from 'react';
import SidebarImageContainer from './SidebarImageContainer';
import SidebarImage from './SidebarImage';
import Passage from './Passage';

const SectionHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="bg-white p-6">
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

const ExampleWrapper = ({ children, height = '500px' }: { children?: React.ReactNode, height?: string }) => (
  <div className="mb-12">
    {/* 
      Standardized height for all preview frames.
      The outer div acts as the scrolling viewport with a fixed height.
      The inner div acts as the flex layout context, allowing content to determine height.
    */}
    <div 
      className="border border-gray-300 shadow-sm bg-white rounded-lg overflow-auto resize w-full" 
      style={{ maxWidth: '100%', height }}
    >
      <div className="flex flex-row min-h-full w-full">
        {children}
      </div>
    </div>
  </div>
);

const Label = ({ title, subtitle, dark = false }: { title: string, subtitle?: string, dark?: boolean }) => (
  <div className={`text-center p-2 ${dark ? 'text-white' : 'text-gray-800'}`}>
    <div className="font-bold text-sm">{title}</div>
    {subtitle && <div className={`text-xs ${dark ? 'text-gray-300' : 'text-gray-500'}`}>{subtitle}</div>}
  </div>
);

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-8 lg:px-16 font-['Inter']">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Sidebar Image Components</h1>
          <p className="text-lg text-gray-600">
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded mt-2 inline-block">
              Try resizing the containers (width & height)!
            </span>
          </p>
        </header>

        {/* 1. Basic Static vs Growing */}
        <SectionHeader 
          title="1. Basic: Static vs. Growing" 
          description="Left: Placeholder retains intrinsic fixed height (whitespace below). Right: Placeholder grows to fill the container height."
        />
        <ExampleWrapper>
          <SidebarImageContainer width="200px" backgroundColor="#f0f0f0">
            <SidebarImage backgroundColor="#bae6fd" height="250px">
              <Label title="Intrinsic Height" subtitle="Fixed 250px" />
            </SidebarImage>
            <div className="p-4 text-xs text-gray-500 text-center">
              (Container Background)
            </div>
          </SidebarImageContainer>
          
          <Passage paragraphs={2} />
          
          <SidebarImageContainer width="200px" backgroundColor="#e2e8f0">
            <SidebarImage backgroundColor="#fed7aa" grow={true}>
              <Label title="Grow: true" subtitle="Fills remaining space" />
            </SidebarImage>
          </SidebarImageContainer>
        </ExampleWrapper>

        {/* 2. Multiple Images Split */}
        <SectionHeader 
          title="2. Multiple Items Split" 
          description="Left: Top grows, Bottom fixed. Right: Top fixed, Middle grows, Bottom fixed."
        />
        <ExampleWrapper>
          <SidebarImageContainer width="200px">
            <SidebarImage backgroundColor="#bbf7d0" grow={true}>
              <Label title="Grow: true" />
            </SidebarImage>
            <SidebarImage backgroundColor="#fbcfe8" height="150px">
              <Label title="Fixed" subtitle="150px" />
            </SidebarImage>
          </SidebarImageContainer>
          
          <Passage paragraphs={3} />
          
          <SidebarImageContainer width="200px">
            <SidebarImage backgroundColor="#c7d2fe" height="100px">
              <Label title="Fixed" subtitle="100px" />
            </SidebarImage>
            <SidebarImage backgroundColor="#fef08a" grow={true}>
              <Label title="Grow: true" />
            </SidebarImage>
            <SidebarImage backgroundColor="#c7d2fe" height="100px">
              <Label title="Fixed" subtitle="100px" />
            </SidebarImage>
          </SidebarImageContainer>
        </ExampleWrapper>

        {/* 3. Sticky vs Static */}
        <SectionHeader 
          title="3. Sticky vs. Static" 
          description="Left: Sticky sidebar (follows scroll). Right: Static sidebar (scrolls away). Resize height to force scrolling."
        />
        <ExampleWrapper>
          <SidebarImageContainer width="180px" sticky={true} backgroundColor="#fafafa">
            <SidebarImage backgroundColor="#fca5a5" height="120px">
              <Label title="Sticky Item" subtitle="I stay in view" />
            </SidebarImage>
            <div className="p-4 bg-yellow-50 text-xs text-yellow-800 border-t border-yellow-100">
              📌 Sticky Container
            </div>
          </SidebarImageContainer>
          
          <Passage paragraphs={6} title="Long Content Scroll Demo" />
          
          <SidebarImageContainer width="180px" backgroundColor="#fafafa">
            <SidebarImage backgroundColor="#d1d5db" height="120px">
              <Label title="Static Item" subtitle="I scroll away" />
            </SidebarImage>
            <div className="p-4 bg-gray-100 text-xs text-gray-500 border-t border-gray-200">
              👋 Static Container
            </div>
          </SidebarImageContainer>
        </ExampleWrapper>

        {/* 4. Backgrounds & Gradients */}
        <SectionHeader 
          title="4. Backgrounds & Gradients" 
          description="Left: CSS Gradient background with growing item. Right: Solid color background with transparent items."
        />
        <ExampleWrapper>
          <SidebarImageContainer 
            width="220px" 
            backgroundGradient="linear-gradient(to bottom right, #4f46e5, #9333ea)"
          >
            <div className="p-6 text-white font-bold text-center">Gradient Container</div>
            <SidebarImage grow={true} backgroundColor="rgba(255,255,255,0.2)">
               <div className="flex flex-col items-center justify-center h-full p-4">
                  <Label title="Transparent Item" dark />
                  <div className="text-[10px] text-gray-300 mt-2 text-center">
                    Grow: true (Fills space)<br/>
                    Bg: white/20
                  </div>
               </div>
            </SidebarImage>
          </SidebarImageContainer>
          
          <Passage paragraphs={2} />
          
          <SidebarImageContainer width="220px" backgroundColor="#1e293b">
             <div className="p-4 text-center text-slate-400 text-sm">
                Solid Dark Container
             </div>
             <SidebarImage backgroundColor="rgba(255,255,255,0.1)" height="100px">
                <div className="flex flex-col items-center justify-center h-full">
                  <Label title="Item 1" subtitle="Fixed 100px" dark />
                  <div className="text-[10px] text-slate-400 mt-1">Bg: white/10</div>
                </div>
             </SidebarImage>
             <SidebarImage backgroundColor="rgba(255,255,255,0.2)" grow={true}>
                 <div className="flex flex-col items-center justify-center h-full">
                    <Label title="Item 2" subtitle="Grow: true" dark />
                    <div className="text-[10px] text-slate-400 mt-1 text-center">
                      Fills remaining height<br/>
                      Bg: white/20
                    </div>
                 </div>
             </SidebarImage>
          </SidebarImageContainer>
        </ExampleWrapper>

        {/* 5. Asymmetric Widths */}
        <SectionHeader 
          title="5. Asymmetric Widths" 
          description="Left: Narrow (100px). Right: Wide (300px). The passage fills the remaining space."
        />
        <ExampleWrapper>
          <SidebarImageContainer width="100px" backgroundColor="#f3f4f6">
             <SidebarImage height="80px" backgroundColor="#fee2e2">
                <div className="text-[10px] text-center font-bold text-red-800">1</div>
             </SidebarImage>
             <SidebarImage backgroundColor="#ffedd5" height="80px">
                <div className="text-[10px] text-center font-bold text-orange-800">2</div>
             </SidebarImage>
             <SidebarImage backgroundColor="#fef9c3" height="80px">
                <div className="text-[10px] text-center font-bold text-yellow-800">3</div>
             </SidebarImage>
             <SidebarImage backgroundColor="#dcfce7" grow={true}>
                <div className="text-[10px] text-center font-bold text-green-800">Grow</div>
             </SidebarImage>
          </SidebarImageContainer>
          
          <Passage paragraphs={3} />
          
          <SidebarImageContainer width="300px" backgroundColor="#e0f2fe">
             <SidebarImage grow backgroundColor="#7dd3fc">
                <Label title="Wide Sidebar" subtitle="300px fixed width" />
             </SidebarImage>
          </SidebarImageContainer>
        </ExampleWrapper>

        {/* 6. Patterns */}
        <SectionHeader 
          title="6. Repeating Patterns (Images)" 
          description="Patterns use background-repeat. These examples retain images as requested."
        />
        <ExampleWrapper>
          <SidebarImageContainer width="150px">
             <SidebarImage 
                src="https://www.transparenttextures.com/patterns/cubes.png" 
                pattern={true}
                backgroundColor="#ffecd2"
                grow={true} 
              />
          </SidebarImageContainer>
          
          <Passage paragraphs={3} />
          
          <SidebarImageContainer width="150px">
             <SidebarImage 
                src="https://www.transparenttextures.com/patterns/diagmonds-light.png" 
                pattern={true}
                backgroundColor="#96c93d"
                grow={true}
              />
          </SidebarImageContainer>
        </ExampleWrapper>

        {/* 7. Seamless Vertical Expansion */}
        <SectionHeader 
          title="7. Seamless Vertical Expansion" 
          description="Using fixed images for top/bottom caps and a repeating pattern for the growing center. All share the same source image to create a continuous look."
        />
        <ExampleWrapper>
          <SidebarImageContainer width="160px">
            <SidebarImage 
               src="https://www.transparenttextures.com/patterns/purty-wood.png" 
               backgroundColor="#e2c08d"
               height="100px"
               objectFit="none"
            >
               <Label title="Top Fixed" subtitle="Image Mode" />
            </SidebarImage>
            <SidebarImage 
               src="https://www.transparenttextures.com/patterns/purty-wood.png" 
               backgroundColor="#e2c08d" 
               pattern={true}
               grow={true}
            >
               <Label title="Middle Grow" subtitle="Pattern Mode" />
            </SidebarImage>
            <SidebarImage 
               src="https://www.transparenttextures.com/patterns/purty-wood.png" 
               backgroundColor="#e2c08d"
               height="100px"
               objectFit="none"
            >
               <Label title="Bottom Fixed" subtitle="Image Mode" />
            </SidebarImage>
          </SidebarImageContainer>
          
          <Passage paragraphs={3} />
          
          <SidebarImageContainer width="160px">
            <SidebarImage 
               src="https://www.transparenttextures.com/patterns/purty-wood.png" 
               backgroundColor="#e2c08d"
               height="100px"
               objectFit="none"
            >
               <Label title="Top Fixed" subtitle="Image Mode" />
            </SidebarImage>
            <SidebarImage 
               src="https://www.transparenttextures.com/patterns/purty-wood.png" 
               backgroundColor="#e2c08d" 
               pattern={true}
               grow={true}
            >
               <Label title="Middle Grow" subtitle="Pattern Mode" />
            </SidebarImage>
            <SidebarImage 
               src="https://www.transparenttextures.com/patterns/purty-wood.png" 
               backgroundColor="#e2c08d"
               height="100px"
               objectFit="none"
            >
               <Label title="Bottom Fixed" subtitle="Image Mode" />
            </SidebarImage>
          </SidebarImageContainer>
        </ExampleWrapper>

        {/* 8. Complex Layout */}
        <SectionHeader 
          title="8. Complex Layout" 
          description="Left: Sticky context with full-height background. Right: Stacked layout."
        />
        <ExampleWrapper>
          {/* 
            To simulate a full-height column that has a sticky element inside, 
            we wrap the sticky SidebarImageContainer in a div that stretches (flex-1) 
            and shares the background color. 
          */}
          <div className="flex flex-col bg-[#fff1f2]">
            <SidebarImageContainer width="200px" sticky={true} backgroundColor="#fff1f2">
              <SidebarImage height="150px" backgroundColor="#fda4af">
                <Label title="Sticky Header" />
              </SidebarImage>
              <div className="p-4 text-center italic text-rose-800 text-sm">
                "Sticky Context Sidebar"
              </div>
              <div className="bg-rose-50 border-t border-rose-100 p-4 text-center text-rose-400 text-xs">
                I am inside the sticky container
              </div>
            </SidebarImageContainer>
            {/* The rest of this column is empty but colored by the wrapper */}
          </div>

          <Passage paragraphs={5} title="The Centerpiece" />

          <SidebarImageContainer width="200px">
            <SidebarImage backgroundColor="#a5f3fc" grow={true}>
               <Label title="Grow Top" />
            </SidebarImage>
            <SidebarImage backgroundColor="#c4b5fd" height="150px">
               <Label title="Fixed Bottom" />
            </SidebarImage>
          </SidebarImageContainer>
        </ExampleWrapper>

        {/* 9. Vertical Alignment Options */}
        <SectionHeader 
          title="9. Vertical Alignment (Container Level)" 
          description="Left: justify-content='flex-end' (Aligned Bottom). Right: justify-content='center' (Aligned Middle)."
        />
        <ExampleWrapper>
          <SidebarImageContainer width="200px" justifyContent="flex-end" backgroundColor="#f3f4f6">
            <div className="text-center text-xs text-gray-400 pt-4">Start of container</div>
            <SidebarImage height="150px" backgroundColor="#86efac">
               <Label title="Bottom Aligned" subtitle="justify: flex-end" />
            </SidebarImage>
          </SidebarImageContainer>

          <Passage paragraphs={3} />

          <SidebarImageContainer width="200px" justifyContent="center" backgroundColor="#e5e7eb">
            <SidebarImage height="100px" backgroundColor="#93c5fd">
               <Label title="Center 1" />
            </SidebarImage>
            <SidebarImage height="100px" backgroundColor="#a5b4fc">
               <Label title="Center 2" subtitle="justify: center" />
            </SidebarImage>
          </SidebarImageContainer>
        </ExampleWrapper>

        {/* 10. Space Between */}
        <SectionHeader 
          title="10. Space Between" 
          description="Left: 2 items spaced apart. Right: 3 items spaced apart."
        />
        <ExampleWrapper>
          <SidebarImageContainer width="200px" justifyContent="space-between" backgroundColor="#fff7ed">
            <SidebarImage height="100px" backgroundColor="#fdba74">
               <Label title="Top" />
            </SidebarImage>
            <SidebarImage height="100px" backgroundColor="#fb923c">
               <Label title="Bottom" subtitle="justify: space-between" />
            </SidebarImage>
          </SidebarImageContainer>

          <Passage paragraphs={3} />

          <SidebarImageContainer width="200px" justifyContent="space-between" backgroundColor="#fff1f2">
            <SidebarImage height="80px" backgroundColor="#fda4af">
               <Label title="Item 1" />
            </SidebarImage>
            <SidebarImage height="80px" backgroundColor="#f43f5e">
               <Label title="Item 2" subtitle="justify: space-between" dark />
            </SidebarImage>
            <SidebarImage height="80px" backgroundColor="#be123c">
               <Label title="Item 3" dark />
            </SidebarImage>
          </SidebarImageContainer>
        </ExampleWrapper>

      </div>
    </div>
  );
};

export default App;