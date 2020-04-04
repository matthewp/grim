import { stamp } from './grim.js';
import { createMachine, interpret, immediate, invoke, reduce, state, transition } from 'https://unpkg.com/robot3@0.2.15/machine.js';

const templateEl = document.querySelector('#timer');

function waitASecond() {
  return new Promise(resolve => setTimeout(resolve, 1000));
}

const machine = createMachine({
  tick: invoke(waitASecond,
    transition('done', 'tock')
  ),
  tock: state(
    immediate('tick',
      reduce(ctx => ({
        seconds: ctx.seconds + 1
      }))
    )
  )
}, () => ({ seconds: 0 }));

export default function(){
  let template = stamp(templateEl);

  let service = interpret(machine, () => {
    frag.update(service.context);
  })

  let frag = template.createInstance(service.context);
  return frag;
};