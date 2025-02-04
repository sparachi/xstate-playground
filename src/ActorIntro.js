
import { createActor, fromPromise, fromTransition } from 'xstate';
// import { useActorRef, useSelector } from '@xstate/react';

const countLogic = fromTransition((state, event)=> {
  if (event.type === 'inc') {
    return { count: state.count + 1 }
  } else if (event.type === 'dec') {
    return { count: state.count - 1 }
  }
  return state;
}, { count: 0 });

const countActor = createActor(countLogic);

countActor.subscribe((snapshot) => { 
  const countElement = document.getElementById('count');
  if (countElement) {
    countElement.innerHTML = snapshot.context.count + '';
  }
});

countActor.start();

const promiseLogic = fromPromise(async (state, event) => {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos/4');
  const data = await response.json();
  console.log(response);
  return data;
});

const promiseActor = createActor(promiseLogic);

promiseActor.subscribe((snapshot) => {
  const todosElement = document.getElementById('todos');
  if (todosElement) {
    todosElement.innerHTML = snapshot.output ? JSON.stringify(snapshot.output) : 'Loading...';
  }
  // document.getElementById('todos')?.innerHTML = snapshot.output ? JSON.stringify(snapshot.output) : 'Loading...';
});

promiseActor.start();

function ActorIntro() {
  // const counterRef1 = useActorRef(countLogic);
  // const countValue = counterRef1.getSnapshot().context.count; // only gives initial value
  // const countValue = useSelector(counterRef1, (state) => state.context.count); // gives updated value

  return (
    <div >
      <h2>Count: <output id="count"></output> </h2>
      <output id="todos"></output>
      {/* <button onClick={() => counterRef1.send({type: 'inc'})}>Increment</button> */}
      {/* <button onClick={() => counterRef1.send({type: 'dec'})}>Decrement</button> */}

      <button onClick={() => countActor.send({type: 'inc'})}>Increment</button>
      <button onClick={() => countActor.send({type: 'dec'})}>Decrement</button>
    </div>
  );
}

export default ActorIntro;
