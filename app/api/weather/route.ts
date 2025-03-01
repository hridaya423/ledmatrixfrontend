import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!process.env.WEATHER_API_KEY) {
    return NextResponse.json(
      { error: 'Server missing weather API key' },
      { status: 500 }
    );
  }

  if (!city) {
    return NextResponse.json(
      { error: 'Missing city parameter' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.WEATHER_API_KEY}`
    );

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Unknown API error' },
        { status: response.status }
      );
    }
    if (!data.weather || !data.weather[0] || !data.main) {
      return NextResponse.json(
        { error: 'Invalid weather data structure' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      icon: data.weather[0].icon
    });

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}