import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as d3 from 'd3';

function Treemap() {
  const { id } = useParams();
  const [currentDataLink, setCurrentDataLink] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({
    "visibility": 'hidden',
    "position": "absolute",
    "left": 0,
    "top": 0
  })
  const [tooltipContent, setTooltipContent] = useState({
    name: '',
    category: '',
    value: '',
  })

  const videoGameSalesUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json';
  const movieSalesUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';
  const kickstarterUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json';

  useEffect(() => {
    const titleElement = document.getElementById('title');
    const descriptionElement = document.getElementById('description');

    switch (id) {
      case 'games':
        setCurrentDataLink(videoGameSalesUrl);
        titleElement.innerText = 'Video Game Sales Data';
        descriptionElement.innerText = 'Top Video Game Sales by Platform and Year';
        break;
      case 'movies':
        setCurrentDataLink(movieSalesUrl);
        titleElement.innerText = 'Movies Sales Data';
        descriptionElement.innerText = 'Top Movies Sales by Genre and Year';
        break;
      case 'kickstarter':
        setCurrentDataLink(kickstarterUrl);
        titleElement.innerText = 'Kickstarter Funding Data';
        descriptionElement.innerText = 'Kickstarter Projects by Category and Funding';
        break;
      default:
        titleElement.innerText = 'Video Game Sales Data';
        descriptionElement.innerText = 'Top Video Game Sales by Platform and Year';
        break;
    }
  }, [id]);

  useEffect(() => {
    if (currentDataLink) {
      fetch(currentDataLink)
        .then(response => response.json())
        .then(data => renderD3Chart(data))
        .catch(error => console.error("Error fetching data:", error));
    }
  }, [currentDataLink]);

  const renderD3Chart = (data) => {

    d3.select('#chart').select('svg').remove();
    d3.select('#legend').select('svg').remove();

    const width = 960;
    const height = 570;

    const root = d3.hierarchy(data);
    const treemap = d3.treemap().size([width, height]).padding(1)
      (root.sum((d) => d.value).sort((a, b) => b.height - a.height || b.value - a.value))
      .descendants();

    const color = d3.scaleOrdinal().domain(new Set(root.leaves().map(el => el.data.category)))
      .range([
        "#FF5733", "#33FF57", "#3375FF", "#FFD700", "#FF33FF", "#33FFFF",
        "#FF8C00", "#DA70D6", "#FF69B4", "#00FF7F", "#7FFF00", "#00BFFF",
        "#FF6347", "#FF4500", "#ADFF2F", "#FFFF00", "#00FA9A", "#87CEEB"
      ]);

    const svg = d3.select('#chart').append('svg').attr('width', width).attr('height', height);

    const nodes = svg.selectAll('g').data(root.leaves()).enter().append('g')
      .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

    nodes.append('rect')
      .attr('class', 'tile')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => color(d.data.category))
      .attr('data-value', d => d.data.value)
      .attr('data-category', d => d.data.category)
      .attr('data-name', d => d.data.name)
      .on('mouseover', (event, d) => {
          setTooltipStyle(t => ({
            ...t,
            'visibility': 'visible',
            'left': `${event.pageX + 30}px`,
            'top': `${event.pageY - 30}px`,
          }));
          setTooltipContent({name: d.data.name,
                            category: d.data.category,
                            value: d.value})
        })
       .on('mouseout', () => {
        setTooltipStyle(t => ({
          ...t,
          "visibility": 'hidden',
        })) 
       })

    nodes.append('text')
      .attr('x', 5)
      .attr('y', 20)
      .text(d => d.data.name)
      .attr('font-size', '12px')
      .attr('fill', 'black');

    const svgLegend = d3.select('#legend').append('svg').attr('width', 500).attr('height', 200);

    const legendHeight = 20;
    
    const legend = svgLegend.selectAll('g')
      .data(color.domain())
      .enter().append('g')
      .attr('transform', (d, i) => `translate(${i % 4 * 500 / 4}, ${Math.floor(i / 4) * 25})`);

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 20)
      .attr('height', legendHeight)
      .attr('fill', color)
      .attr('class', 'legend-item')

    legend.append('text')
      .attr('x', 25)
      .attr('y', legendHeight / 2)
      .attr('dy', '0.35em')
      .text(d => d)
      .attr('font-size', '12px')
      .attr('fill', 'black');
  };

  return (
    <>
        <nav className="links">
            <Link to="/treemap-diagram/games">Video Game Data Set</Link>
            {` | `}
            <Link to="/treemap-diagram/movies">Movies Data Set</Link>
            {` | `}
            <Link to="/treemap-diagram/kickstarter">Kickstarter Data Set</Link>
        </nav>
      <section>
        <header>
          <h1 id='title'></h1>
          <p id='description'></p>
        </header>
        <div id="chart"></div>
        <div id="legend"></div>
      </section>
      <div id='tooltip' style={tooltipStyle} data-value={tooltipContent.value}>
        Name: {tooltipContent.name} Category: {tooltipContent.category} Value: {tooltipContent.value}
      </div>
    </>
  );
}

export default Treemap;