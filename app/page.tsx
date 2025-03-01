/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
}


export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FFFFFF');
  const [status, setStatus] = useState('');
  const [penSize, setPenSize] = useState(1);
  const [productiveMode, setProductiveMode] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState('');
  const [city, setCity] = useState('London');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const savedCanvas = useRef<ImageData | null>(null);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        sendCanvasData();
      }
    }
  }, []);

  useEffect(() => {
    if (productiveMode) {
      const fetchAndUpdate = async () => {
        await fetchWeather();
        drawDashboard();
      };

      const fetchWeather = async () => {
        try {
          setWeatherLoading(true);
          setWeatherError('');
          console.log('⏳ Fetching weather for:', city);
          
          const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
          const responseText = await response.text();
          console.log('🔔 Raw API Response:', responseText);
      
          if (!response.ok) {
            console.error('❌ API Error Response:', response.status);
            try {
              const errorData = JSON.parse(responseText);
              throw new Error(errorData.error || `API Error: ${response.status}`);
            } catch (jsonError) {
              throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
            }
          }
      
          const data = JSON.parse(responseText);
          console.log('✅ Parsed Weather Data:', data);
          
          if (!data.temp || !data.condition) {
            throw new Error('Invalid weather data structure');
          }
      
          setWeatherData(data);
          setWeatherError('');
      
        } catch (err) {
          console.error('🔥 Full Error:', err);
          setWeatherError(err instanceof Error ? err.message : 'Unknown error');
          setWeatherData(null);
        } finally {
          setWeatherLoading(false);
        }
      };
      
  
      fetchAndUpdate();
    const interval = setInterval(fetchAndUpdate, 600000);
    return () => clearInterval(interval);
    }
  }, [productiveMode, city])

  useEffect(() => {
    if (productiveMode) {
      console.log('🔄 Triggering dashboard update');
      drawDashboard();
    }
  }, [weatherData, productiveMode, scrollOffset]);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    setIsDrawing(true);
    draw(e);
  };

  const finishDrawing = () => {
    setIsDrawing(false);
    sendCanvasData();
  };

  const fontMap: { [key: string]: number[][] } = {
    '0': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
    '1': [[0,1,0],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
    '2': [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
    '3': [[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]],
    '4': [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
    '5': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
    '6': [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
    '7': [[1,1,1],[0,0,1],[0,0,1],[0,0,1],[0,0,1]],
    '8': [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
    '9': [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]],
    'A': [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
    'B': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,1,0]],
    'C': [[1,1,1],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
    'D': [[1,1,0],[1,0,1],[1,0,1],[1,0,1],[1,1,0]],
    'E': [[1,1,1],[1,0,0],[1,1,1],[1,0,0],[1,1,1]],
    'F': [[1,1,1],[1,0,0],[1,1,1],[1,0,0],[1,0,0]],
    'G': [[1,1,1],[1,0,0],[1,0,1],[1,0,1],[1,1,1]],
    'H': [[1,0,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
    'I': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
    'J': [[0,0,1],[0,0,1],[0,0,1],[1,0,1],[1,1,1]],
    'K': [[1,0,1],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
    'L': [[1,0,0],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
    'M': [[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,0,1]],
    'N': [[1,0,1],[1,1,1],[1,1,1],[1,1,1],[1,0,1]],
    'O': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
    'P': [[1,1,1],[1,0,1],[1,1,1],[1,0,0],[1,0,0]],
    'Q': [[1,1,1],[1,0,1],[1,0,1],[1,1,1],[0,0,1]],
    'R': [[1,1,1],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
    'S': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
    'T': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
    'U': [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
    'V': [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
    'W': [[1,0,1],[1,0,1],[1,0,1],[1,1,1],[1,0,1]],
    'X': [[1,0,1],[1,0,1],[0,1,0],[1,0,1],[1,0,1]],
    'Y': [[1,0,1],[1,0,1],[0,1,0],[0,1,0],[0,1,0]],
    'Z': [[1,1,1],[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
    ':': [[0],[1],[0],[1],[0]],
    ' ': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
    '.': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,1,0]],
    ',': [[0,0,0],[0,0,0],[0,0,0],[0,1,0],[1,0,0]],
    '°': [[1,1,0],[1,1,0],[0,0,0],[0,0,0],[0,0,0]],
    '-': [[0,0,0],[0,0,0],[1,1,1],[0,0,0],[0,0,0]],
    '/': [[0,0,1],[0,0,1],[0,1,0],[1,0,0],[1,0,0]],
  };

  const drawText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    text.split('').forEach((char, i) => {
      const pixels = fontMap[char.toUpperCase()] || fontMap[' '];
      pixels.forEach((row, dy) => {
        row.forEach((filled, dx) => {
          if (filled) ctx.fillRect(x + i * 4 + dx, y + dy, 1, 1);
        });
      });
    });
  };

  const largeDigitMap: { [key: string]: number[][] } = {
    '0': [
      [1,1,1],
      [1,0,1],
      [1,0,1],
      [1,0,1],
      [1,0,1],
      [1,0,1],
      [1,1,1]
    ],
    '1': [
      [0,1,0],
      [1,1,0],
      [0,1,0],
      [0,1,0],
      [0,1,0],
      [0,1,0],
      [1,1,1]
    ],
    '2': [
      [1,1,1],
      [0,0,1],
      [0,0,1],
      [1,1,1],
      [1,0,0],
      [1,0,0],
      [1,1,1]
    ],
    '3': [
      [1,1,1],
      [0,0,1],
      [0,0,1],
      [1,1,1],
      [0,0,1],
      [0,0,1],
      [1,1,1]
    ],
    '4': [
      [1,0,1],
      [1,0,1],
      [1,0,1],
      [1,1,1],
      [0,0,1],
      [0,0,1],
      [0,0,1]
    ],
    '5': [
      [1,1,1],
      [1,0,0],
      [1,0,0],
      [1,1,1],
      [0,0,1],
      [0,0,1],
      [1,1,1]
    ],
    '6': [
      [1,1,1],
      [1,0,0],
      [1,0,0],
      [1,1,1],
      [1,0,1],
      [1,0,1],
      [1,1,1]
    ],
    '7': [
      [1,1,1],
      [0,0,1],
      [0,0,1],
      [0,0,1],
      [0,0,1],
      [0,0,1],
      [0,0,1]
    ],
    '8': [
      [1,1,1],
      [1,0,1],
      [1,0,1],
      [1,1,1],
      [1,0,1],
      [1,0,1],
      [1,1,1]
    ],
    '9': [
      [1,1,1],
      [1,0,1],
      [1,0,1],
      [1,1,1],
      [0,0,1],
      [0,0,1],
      [1,1,1]
    ],
    ':': [
      [0,0,0],
      [0,1,0],
      [0,0,0],
      [0,0,0],
      [0,0,0],
      [0,1,0],
      [0,0,0]
    ]
  };

  const drawLargeText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    text.split('').forEach((char, i) => {
      const pattern = largeDigitMap[char] || [];
      pattern.forEach((row, dy) => {
        row.forEach((pixel, dx) => {
          if (pixel) {
            ctx.fillRect(x + i * 4 + dx, y + dy, 1, 1);
          }
        });
      });
    });
  };

  const drawWeatherIcon = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number) => {
    if (!weatherData) return;

    const condition = weatherData.condition.toLowerCase();
    ctx.fillStyle = '#FFFFFF';

    if (condition.includes('cloud')) {
      ctx.fillRect(x+2, y+3, 4, 2);
      ctx.fillRect(x, y+5, 8, 2);
      ctx.fillRect(x+1, y+2, 6, 3);
    } else if (condition.includes('rain')) {
      ctx.fillRect(x+2, y+3, 4, 2);
      ctx.fillRect(x, y+5, 8, 2);
      ctx.fillRect(x+1, y+2, 6, 3);
      ctx.fillStyle = '#00BFFF';
      ctx.fillRect(x+3, y+6, 1, 2);
      ctx.fillRect(x+5, y+7, 1, 2);
      ctx.fillRect(x+7, y+6, 1, 2);
    } else {
      ctx.fillStyle = '#FFFF00';
      ctx.fillRect(x + 4, y + 3, 2, 2);
      ctx.fillRect(x + 4, y, 2, 2);
      ctx.fillRect(x + 7, y + 3, 2, 2);
      ctx.fillRect(x + 4, y + 6, 2, 2);
      ctx.fillRect(x + 1, y + 3, 2, 2);
    }
  }, [weatherData]);

  const drawVerticalLine = (ctx: CanvasRenderingContext2D, x: number, yStart: number, height: number, color: string) => {
    ctx.fillStyle = color;
    for (let y = yStart; y < yStart + height; y++) {
      ctx.fillRect(x, y, 1, 1);
    }
  };

  const drawWeatherInfo = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    if (weatherLoading) {
      drawText(ctx, "⌛ Loading...", x, y, '#FFFFFF');
      return;
    }
    
    if (weatherError) {
      drawText(ctx, "❌ Error", x, y, '#FF0000');
      drawText(ctx, weatherError.substring(0, 6), x, y + 6, '#FF0000');
      return;
    }
    
    if (!weatherData) {
      drawText(ctx, "📡 No Data", x, y, '#FFFFFF');
      return;
    }
  
    drawWeatherIcon(ctx, x, y);
    drawText(ctx, `${weatherData.temp}°C`, x + 2, y + 10, '#FFAA00');
    const condition = weatherData.condition.length > 6 
      ? weatherData.condition.substring(0, 6)
      : weatherData.condition;
    drawText(ctx, condition, x, y + 15, '#FFFFFF');
  };

  const drawTodoList = (ctx: CanvasRenderingContext2D, x: number, y: number, items: string[], offset: number) => {
    drawText(ctx, "", x, y, '#00FF00');
    
    const offsetY = Math.floor(offset / 8) % Math.max(items.length, 1);
    
    for (let i = 0; i < 3; i++) {
      const itemIndex = (i + offsetY) % items.length;
      const item = items[itemIndex];
      if (item) {
        const bulletColor = i === 0 ? '#FF0000' : (i === 1 ? '#FFFF00' : '#00FF00');
        
        ctx.fillStyle = bulletColor;
        ctx.fillRect(x, y + 3 + (i * 5), 2, 2);
        
        drawText(ctx, item, x + 3, y + 3 + (i * 5), '#FFFFFF');
      }
    }
  };

  const drawDashboard = () => {
    const canvas = canvasRef.current;
    if (!canvas || !productiveMode) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    const now = new Date();
    
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    const weekday = now.toLocaleDateString('en-US', { weekday: 'short' });
    
    const day = now.getDate().toString();
    const month = now.toLocaleDateString('en-US', { month: 'short' });
    const dateStr = `${day} ${month}`;
    
    drawLargeText(ctx, timeStr, 2, 2, '#FFFFFF');
    
    drawText(ctx, weekday, 2, 12, '#00FFFF');
    
    drawText(ctx, dateStr, 2, 18, '#00FFFF');
    
    drawVerticalLine(ctx, 31, 2, 28, '#333333');
    
    drawWeatherInfo(ctx, 33, 2);
    
    drawTodoList(ctx, 33, 17, [""], scrollOffset);
  
    sendCanvasData();
  };

  const toggleProductiveMode = () => {
    if (!productiveMode) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          savedCanvas.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
      }
      clearCanvas();
    }
    setProductiveMode(!productiveMode);
    setScrollOffset(0);
  };
  
  useEffect(() => {
    if (productiveMode) {
      const interval = setInterval(() => {
        setScrollOffset(prev => (prev + 1) % 100);
        drawDashboard();
      }, 100);
      return () => clearInterval(interval);
    }
  }, [productiveMode]);

  const draw = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = color;
        for (let px = 0; px < penSize; px++) {
          for (let py = 0; py < penSize; py++) {
            const nx = x + px - Math.floor(penSize/2);
            const ny = y + py - Math.floor(penSize/2);
            if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
              ctx.fillRect(nx, ny, 1, 1);
            }
          }
        }
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        sendCanvasData();
      }
    }
  };

  const drawTestPattern = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FF0000';
        for (let x = 0; x < canvas.width; x++) {
          ctx.fillRect(x, 0, 1, 3);
        }
        
        ctx.fillStyle = '#00FF00';
        for (let x = 0; x < canvas.width; x++) {
          ctx.fillRect(x, canvas.height - 3, 1, 3);
        }
        ctx.fillStyle = '#0000FF';
        for (let y = 0; y < canvas.height; y++) {
          ctx.fillRect(0, y, 3, 1);
        }
        
        ctx.fillStyle = '#FFFF00';
        for (let y = 0; y < canvas.height; y++) {
          ctx.fillRect(canvas.width - 3, y, 3, 1);
        }
        
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < canvas.width; i++) {
          ctx.fillRect(i, Math.floor(canvas.height / 2), 1, 1);
        }
        for (let i = 0; i < canvas.height; i++) {
          ctx.fillRect(Math.floor(canvas.width / 2), i, 1, 1);
        }
        
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(10, 10, 10, 10);
        
        ctx.fillStyle = '#00FFFF';
        ctx.fillRect(canvas.width - 20, 10, 10, 10);
        
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(10, canvas.height - 20, 10, 10);
        
        ctx.fillStyle = '#800080';
        ctx.fillRect(canvas.width - 20, canvas.height - 20, 10, 10);
        
        sendCanvasData();
      }
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (tempCtx) {
            tempCtx.imageSmoothingEnabled = false;
            
            const scale = Math.min(
              canvas.width / img.width,
              canvas.height / img.height
            );
            
            const x = Math.floor((canvas.width - img.width * scale) / 2);
            const y = Math.floor((canvas.height - img.height * scale) / 2);
            
            tempCtx.drawImage(
              img, 
              0, 0, img.width, img.height,
              x, y, 
              Math.floor(img.width * scale), 
              Math.floor(img.height * scale)
            );
            
            const imgData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < imgData.data.length; i += 4) {
              if (imgData.data[i + 3] < 128) continue;
              
              imgData.data[i]   = Math.min(255, Math.round(imgData.data[i] / 17) * 17);
              imgData.data[i+1] = Math.min(255, Math.round(imgData.data[i+1] / 17) * 17);
              imgData.data[i+2] = Math.min(255, Math.round(imgData.data[i+2] / 17) * 17);

            }
            
            tempCtx.putImageData(imgData, 0, 0);
            
            ctx.drawImage(tempCanvas, 0, 0);
            
            sendCanvasData();
          }
        }
      }
    };
    img.src = URL.createObjectURL(file);
  };


  const sendCanvasData = async () => {
    setStatus('Sending data to matrix...');
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = [];
    
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const pos = (y * canvas.width + x) * 4;
        
        const r = imgData.data[pos];
        const g = imgData.data[pos + 1];
        const b = imgData.data[pos + 2];
        
        pixels.push({ r, g, b });
      }
    }
    
    try {
      const response = await fetch('/api/matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixels }),
      });
      
      const data = await response.json();
      if (data.success) {
        setStatus(`Matrix updated successfully! (${pixels.length} pixels)`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Failed to send data: ${error}`);
      console.error('Error sending canvas data:', error);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">LED Matrix Drawing (64×32)</h1>
      
      <div className="mb-4 text-center space-x-4">
        <label>Color:</label>
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)} 
          className="border border-gray-300 rounded"
        />
        
        <label className="ml-4">Pen Size:</label>
        <input
          type="range"
          min="1"
          max="5"
          value={penSize}
          onChange={(e) => setPenSize(parseInt(e.target.value))}
          className="align-middle"
        />
        <span>{penSize}px</span>
      </div>
      
      <div className="flex justify-center mb-4">
        <canvas
          ref={canvasRef}
          width={64}
          height={32}
          className="border border-gray-400"
          style={{ width: '640px', height: '320px', imageRendering: 'pixelated' }}
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
          onMouseLeave={finishDrawing}
        />
      </div>
      
      <div className="flex justify-center gap-2 mb-4">
        <button 
          onClick={clearCanvas}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Clear Canvas
        </button>
        
        <button
          onClick={drawTestPattern}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Test Pattern
        </button>
        
        <button
          onClick={sendCanvasData}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Update Matrix
        </button>
        <button
        onClick={toggleProductiveMode}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        {productiveMode ? 'Exit Productive Mode' : 'Productive Mode'}
      </button>
      </div>
      
      <div className="flex justify-center mb-4">
      <div>
    <label className="block text-sm font-medium mb-1">City:</label>
    <input
      type="text"
      value={city}
      onChange={(e) => setCity(e.target.value)}
      className="border border-gray-300 p-1 rounded"
      placeholder="Enter city name"
    />
  </div>
        <div>
          <label className="block text-sm font-medium mb-1">Upload Image:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleUpload}
            className="border border-gray-300 p-1 rounded w-full" 
          />
        </div>
      </div>
      
      {status && (
        <div className="mt-2 text-center">
          <p className={status.includes('Error') ? 'text-red-500' : 'text-green-500'}>
            {status}
          </p>
        </div>
      )}
    </div>
  );
}