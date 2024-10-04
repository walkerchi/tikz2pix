import { jsPDF } from 'jspdf'
// import {svg2pdf} from 'svg2pdf.js';

export const downloadSVG = (containerRef)=>{
    const svgElement = containerRef.current.querySelector('svg');

    if (svgElement) {
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'tikz.svg'; // Desired file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up the URL object
      }
  }
  
export const downloadPNG = (containerRef,  backgroundColor, scaleFactor) => {

    const svgElement = containerRef.current.querySelector("svg");
    console.log(svgElement)
    if (svgElement) {
      // Create a Blob from the SVG data
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const encodedData = encodeURIComponent(svgString);
      const imgSrc = `data:image/svg+xml;charset=utf-8,${encodedData}`;

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      const img = new Image();
      img.onload = () => {
        // Set canvas dimensions to match the SVG
        canvas.width = svgElement.clientWidth * scaleFactor;
        canvas.height = svgElement.clientHeight * scaleFactor;
        
        context.scale(scaleFactor, scaleFactor);    

        if(backgroundColor === "white"){
            console.log(`background color is white`)
            context.fillStyle = "white"
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        context.drawImage(img, 0, 0);

        // Convert canvas to PNG
        const pngData = canvas.toDataURL('image/png');

        // Create a link to download the PNG
        const link = document.createElement('a');
        link.href = pngData;
        link.download = 'tikz.png'; // Desired file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      img.src = imgSrc; // Set the image source to the SVG data
    }
  }

export const downloadPDF = (containerRef) => {
    const svgElement = containerRef.current.querySelector("svg");
    // if (svgElement) {
    //   const pdf = new jsPDF();

    //   pdf.svg(svgElement, 0, 0, svgElement.clientWidth, svgElement.clientHeight)
    //      .then(()=>{
    //         pdf.save("tikz.pdf")
    //      })
        
    // }
  }
