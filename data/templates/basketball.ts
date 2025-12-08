import { SportDefinition } from '../../types';

export const basketball: SportDefinition = {
  id: 'basketball',
  label: 'Basketball',
  cuts: {
    mens: {
      jersey: {
        shape: {
          // Modeled after the SVG: Tapered athletic fit, deep racer-style armholes, rounded hem
          front: "M110 20 C145 45 255 45 290 20 L325 35 C325 35 305 160 315 280 L315 460 C315 490 200 500 85 460 L85 280 C95 160 75 35 75 35 L110 20 Z",
          back: "M110 20 C145 30 255 30 290 20 L325 35 C325 35 305 160 315 280 L315 460 C315 490 200 500 85 460 L85 280 C95 160 75 35 75 35 L110 20 Z",
        },
        trim: {
          // Compound path: Defines the neck ring and the armhole rings accurately
          front: "M110 20 C145 45 255 45 290 20 L280 15 C250 35 150 35 120 15 Z M75 35 C95 160 85 280 85 280 L95 280 C95 280 105 160 85 40 Z M325 35 C305 160 315 280 315 280 L305 280 C305 280 295 160 315 40 Z",
          back: "M110 20 C145 30 255 30 290 20 L280 15 C250 25 150 25 120 15 Z M75 35 C95 160 85 280 85 280 L95 280 C95 280 105 160 85 40 Z M325 35 C305 160 315 280 315 280 L305 280 C305 280 295 160 315 40 Z"
        }
      },
      shorts: {
        shape: {
          // Modeled after SVG: Distinct waistband, separate legs, V-notch at hem
          front: "M80 50 L90 60 C92 100 95 180 95 280 L95 360 L105 370 L195 370 L200 180 L205 370 L295 370 L305 360 L305 280 C305 180 308 100 310 60 L320 50 L80 50 Z",
          back: "M80 50 L90 60 C92 100 95 180 95 280 L95 360 L105 370 L195 370 L200 180 L205 370 L295 370 L305 360 L305 280 C305 180 308 100 310 60 L320 50 L80 50 Z"
        },
        trim: {
          // Waistband detail + Hem trim
          front: "M80 50 L320 50 L310 80 L90 80 Z M95 360 L105 370 L195 370 L195 355 L105 355 L95 345 Z M305 360 L295 370 L205 370 L205 355 L295 355 L305 345 Z",
          back: "M80 50 L320 50 L310 80 L90 80 Z M95 360 L105 370 L195 370 L195 355 L105 355 L95 345 Z M305 360 L295 370 L205 370 L205 355 L295 355 L305 345 Z"
        }
      }
    },
    womens: {
      jersey: {
        shape: {
          // Racerback cut
          front: "M120 20 C150 40 250 40 280 20 L310 40 C310 40 290 150 300 260 L310 460 C310 460 200 480 90 460 L100 260 C110 150 90 40 90 40 L120 20 Z",
          back: "M130 20 C150 20 250 20 270 20 L290 40 C270 90 290 180 300 260 L310 460 C310 460 200 480 90 460 L100 260 C110 180 130 90 110 40 L130 20 Z",
        },
        trim: {
          front: "M120 20 C150 40 250 40 280 20 L275 15 C250 30 150 30 125 15 Z M90 40 C110 150 100 260 100 260 L110 260 C110 260 120 150 100 40 Z M310 40 C290 150 300 260 300 260 L290 260 C290 260 280 150 300 40 Z",
          back: "M130 20 L270 20 L260 25 L140 25 Z M110 40 C130 90 110 180 100 260 L110 260 C120 180 140 90 120 40 Z M290 40 C270 90 290 180 300 260 L290 260 C280 180 260 90 280 40 Z"
        }
      },
      shorts: {
        shape: {
          front: "M90 50 L100 60 C102 100 105 180 105 270 L100 350 L105 360 L195 360 L200 180 L205 360 L295 360 L300 350 L295 270 C295 180 298 100 300 60 L310 50 L90 50 Z",
          back: "M90 50 L100 60 C102 100 105 180 105 270 L100 350 L105 360 L195 360 L200 180 L205 360 L295 360 L300 350 L295 270 C295 180 298 100 300 60 L310 50 L90 50 Z"
        },
        trim: {
          front: "M90 50 L310 50 L305 75 L95 75 Z M100 350 L105 360 L195 360 L195 345 L105 345 L100 335 Z M300 350 L295 360 L205 360 L205 345 L295 345 L300 335 Z",
          back: "M90 50 L310 50 L305 75 L95 75 Z M100 350 L105 360 L195 360 L195 345 L105 345 L100 335 Z M300 350 L295 360 L205 360 L205 345 L295 345 L300 335 Z"
        }
      }
    }
  },
  templates: [
    {
      id: 'classic',
      label: 'Classic',
      layers: []
    },
    {
      id: 'pinstripe',
      label: 'Retro Pinstripe',
      layers: [
        {
          id: 'stripes',
          label: 'Pinstripes',
          paths: {
            jersey: {
              front: "M130 20 L130 480 M170 40 L170 480 M210 50 L210 480 M250 50 L250 480 M290 40 L290 480",
              back: "M130 20 L130 480 M170 40 L170 480 M210 50 L210 480 M250 50 L250 480 M290 40 L290 480"
            },
            shorts: {
              front: "M130 80 L130 370 M170 80 L170 370 M230 80 L230 370 M270 80 L270 370",
              back: "M130 80 L130 370 M170 80 L170 370 M230 80 L230 370 M270 80 L270 370"
            }
          }
        }
      ]
    },
    {
      id: 'modern-side',
      label: 'Pro Side Fade',
      layers: [
        {
          id: 'side-panels',
          label: 'Side Panels',
          paths: {
            jersey: {
              // Swooping side panel similar to the SVG reference flow
              front: "M85 280 L85 460 L120 460 C120 350 110 150 95 100 Z M315 280 L315 460 L280 460 C280 350 290 150 305 100 Z",
              back: "M85 280 L85 460 L120 460 C120 350 110 150 95 100 Z M315 280 L315 460 L280 460 C280 350 290 150 305 100 Z"
            },
            shorts: {
              front: "M90 80 L95 360 L125 370 L130 80 Z M310 80 L305 360 L275 370 L270 80 Z",
              back: "M90 80 L95 360 L125 370 L130 80 Z M310 80 L305 360 L275 370 L270 80 Z"
            }
          }
        }
      ]
    },
    {
      id: 'wishbone',
      label: 'Wishbone Collar',
      layers: [
        {
          id: 'collar-accent',
          label: 'Wishbone',
          paths: {
            jersey: {
              // The "Y" shape collar often seen in college/pro
              front: "M110 20 L200 120 L290 20 L280 15 L200 100 L120 15 Z",
              back: "M110 20 C145 30 255 30 290 20 L290 30 C255 40 145 40 110 30 Z"
            },
            shorts: {
              // Matching belt buckle accent
              front: "M180 50 L220 50 L220 80 L180 80 Z",
              back: ""
            }
          }
        }
      ]
    },
    {
      id: 'city-edition',
      label: 'City Gradient',
      layers: [
        {
          id: 'horizon',
          label: 'Horizon Line',
          paths: {
            jersey: {
              // A thick chest band (like Jazz/Nuggets styles)
              front: "M75 300 L325 300 L325 360 L75 360 Z M75 380 L325 380 L325 400 L75 400 Z",
              back: "M75 300 L325 300 L325 360 L75 360 Z M75 380 L325 380 L325 400 L75 400 Z"
            },
            shorts: {
              // Asymmetrical leg bands
              front: "M95 300 L195 300 L200 370 L100 370 Z",
              back: "M95 300 L195 300 L200 370 L100 370 Z"
            }
          }
        }
      ]
    }
  ]
};