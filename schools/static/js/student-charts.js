function initializeCharts(performanceTrendData, subjectRadarData) {
    // Clear existing charts if any
    const trendChart = Chart.getChart('performanceTrendChart');
    const radarChart = Chart.getChart('subjectRadarChart');
    
    if (trendChart) trendChart.destroy();
    if (radarChart) radarChart.destroy();

    // Register the Chart.js plugins
    Chart.register(ChartAnnotation);

    // Performance Trend Chart
    const trendCtx = document.getElementById('performanceTrendChart');
    if (trendCtx) {
        new Chart(trendCtx, {
            type: 'line',
            data: performanceTrendData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            },
                            filter: function(item) {
                                return item.text === 'Average Performance';
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#000',
                        bodyColor: '#666',
                        borderColor: '#ddd',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                let level = '';
                                if (value >= 80) level = 'Exceeding Expectations';
                                else if (value >= 65) level = 'Meeting Expectations';
                                else if (value >= 50) level = 'Approaching Expectations';
                                else level = 'Below Expectations';
                                
                                return `Performance: ${value.toFixed(1)}% (${level})`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MMM D'
                            }
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // Subject Radar Chart
    const radarCtx = document.getElementById('subjectRadarChart');
    if (radarCtx) {
        new Chart(radarCtx, {
            type: 'radar',
            data: subjectRadarData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                }
            }
        });
    }
} 