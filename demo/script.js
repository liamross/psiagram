import { Paper, Node } from '../src';

var myPaper = null;

function loadPaper() {
    console.log('load paper');
    myPaper = new Paper({
        width: '1300px',
        height: '900px',
        attributes: {
            gridSize: 20,
        },
        initialConditions: {},
    });
    const target = document.getElementById('_target');
    target.appendChild(myPaper.getPaperElement());
}

function addNode() {
    /*
        {
            id: string (unique for paper instance),
            coords: ICoords{ // Top-left corner of the node
                x,
                y,
                [z]
            },
            component: INodeComponent,
            props: IComponentProps{
                [
                  content: HTMLElement,
                    (or),
                  title: string,
                  icon: string
              ]
            }
        }
    */
    if (myPaper) {
        const node = {
            id: `new_node_test`,
            coords: {
                x: 320,
                y: 160,
            },
            component: Node,
            props: {
                width: 160,
                height: 80,
                title: 'Title 1',
            }
        }
        myPaper.addNode(node);
    }
}

document.getElementById('_testbutton').addEventListener('click', addNode)

document.addEventListener('DOMContentLoaded', () => loadPaper());