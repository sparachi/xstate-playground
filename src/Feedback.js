import React, { useState } from 'react';
import { assign, createMachine, fromPromise, setup } from 'xstate';
import { useMachine } from '@xstate/react';

const INITIAL_STATE = {
    feedback: '',
    savedFeedbackSuccess: false
};
const feedbackMachine = setup({
    guards: {
        isFeedbackValid: ({context}) => { return context.feedback.trim().length > 0 },
    },
    actors: {   // actors are used to manage side effects
        saveFeedback: fromPromise(async () => {
            await new Promise((resolve, reject) => {
                 setTimeout(() => {
                    resolve();
                }, 1000);
            });
            return { success: true };
        }),
    },
}).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAYkwBsB7WMAbQAYBdRUAB2twBddL8WQAHogAsAZgB0AVgBsogOwBGYQvoAOFfVEAaEAE9E01eIBMh+rMnH6C43NGqAvg51oseQkXGsATpVStOEgBxAHkQgBEGZiQQdlguHj4YoQRVQ3FpRVUATklJO2lhYR19BHkjbLlpSVUc4xk1TKcXDBwCYi9ff0CAIQBBSKZ+OITefhTVOSNMhRy8gqKSkTls8UrqlezNSWFjSeaQVzaPTr8A8VhOMFYFYLDB6LYObjHkkQVVncly1Uls01qkiWCGE2WkGWM2TEqnqNhhxgOR3cHR8Z04FyuNxI-Qew2eiXGIis4mE0lkm2qohU2WBu1WwiqNWytVBWURrWRnlR3Qx12MdwiUTx8ReSVAKWkkPEolEf1EksM2Xs2j0iEkCgU4hyomMYjkxlswnUwnZbnaXK650ufOxAyFMRGosJINUElUDLJKxWNi+wPlwgy9E0NjsruEeVNxxRlvR1tYogFuId+Ne4sQk2mWVy+X9xVVIKlHqZLMqCiqkc5px5cYTOPtTxFBLeCEKmuks3kCiZ9GM8lphcZORLbOchw55vEkAS+CgJAAwgAJPoAOSCAFF67EU2LBIgFPK5NK5TDvdkoXJgd9Vkoy3kDe21HIKxOp9wZyQAEprgDKa4AKpujpNmmCD7nIkgksYsyKBq9ByHIuy0rsGS1IUlg2FY+yjkiL4QNOs79HOADSgHbs6tiHj6QYHvUPaqMCZIQfqGz0MI1grBG2Hjicr4ELO34AKo9AAsgAkgBQzJo2qa7ggFHiFRmiZLRezAoo4L3jUvbWLkrHPjx3i+N4n7-h+ACapHSTuKQ5tKzLhsp4ZyHBwKTExpj5D2OxVOG+kdLAACuABGqBcG+s4QLwYDiAQABulAANbRThJyBSFYV8QgcWUJg6CilElmjNZiCmJRtFKfqkh0cCVjGCYVVBnB3yWFYJpcWaqXBaFnDhSQYCGZQ3heOQeUAGaDag4gpf5XUZTOWX4PFuX5UwhVOs2exlQ1NFVap+YsiSjI1EUeQwo47VRp4aXdb1AiXHl0XoKNVzeMgVhBqQ01XbNPV8WtwGyZtCnlTt1X7fKayMvBVI2LK2ROKO+CUBAcD8F9wpFc6AC00jAljHwmFSSqiOYRQGn8fkWmiGPrSBpgBopoN7aU8kaCTspzFMkiU1WVqYgoNMAykVJ1Yzym7fR+a7HVvxdj5Rrwk+F2VtyfN8oLMk2cSqjWPkUJQR8iFSwO1RDu6pbnS0HXRmivLxhrxUIAUWoylUMrs3Yxj9jL6o1KGYJKDIPO8TODvOmemp7Oqnu5PCkulJ6UhGkG-zWPQMhK1bl2TgN3hh82RpumdVKGGx6hgq5VQmB59PZF2lQIsrE7XXNUD5yBRulK6Eg6mS9BbFSRTSDzFDUJA7eyZUlFlgadjOXBXv5gadXrJ57ofDM3MI0AA */
    initial: 'prompt',
    context: INITIAL_STATE,
    on: {
        /** Global events */
        close: {
            target: '.closed'
        }
    },
    states: {
        prompt: {
            id: 'prompt',
            initial: 'step1',
            states: {  // nested states
                step1: {
                    on: {
                        GOOD: {
                            target: 'step2'
                        }
                        // BAD event will be bubbled up and moves to 'editing' state
                    }
                },
                step2: {
                    on: {
                        GOOD: {
                            target: 'step3'
                        }
                        // BAD event will be bubbled up and moves to 'editing' state

                    }
                },
                step3: {
                    on: {
                        GOOD: {
                            target: '#editing'
                        }
                    }
                    // BAD event will be bubbled up and moves to 'editing' state

                },
            },
            on: {
                GOOD: {
                    target: 'closed'
                },
                BAD: {
                    target: 'editing'
                }
            }
        },
        editing: {
            id: 'editing',
            on: {
                CHANGE: {
                    // actions: assign(({event}) => {
                    //     return {
                    //         feedback: event.value
                    //     };
                    // })
                    // OR like below, with multiple action functions
                    // OR use enqueue to add actions to the end of the actions array
                    actions: [assign({feedback: ({ context, event}) => {return event.value }}), ({event}) => { console.log('Feedback changed' + event.value)}]
                },
                RESET: {
                    actions: assign({
                        feedback: INITIAL_STATE
                    })
                },
                BACK: 'prompt',
                SUBMIT: {
                    // guard: 'isFeedbackValid',
                    guard: {
                        type: 'isFeedbackValid'
                    },
                    target: 'submitting'
                }
            }
        },
        error: {
            id: 'error',
            on: {
                RETRY: 'editing'
            }
        },
        submitting: {
            id: 'submitting',
            invoke: {
                // src: fromPromise(async () => {
                //     await new Promise((resolve, reject) => {
                //          setTimeout(() => {
                //             resolve();
                //         }, 3000);
                //     });
                //     return { success: true };
                // }),
                src: 'saveFeedback',
                onDone: {
                    actions: assign({
                        savedFeedbackSuccess: ({event}) => event.output.success + ''
                    }),
                    target: 'closed'
                },
                onError: {
                    target: 'error'
                }
            },
            after: {
                2000: 'error'
            },
            // OR like below
            // on: {
            //     'xstate.after.2000:submitting' : {
            //         target: 'error'
            //     }
            // }
        },
        closed: {
            id: 'closed',
            type: 'final'
        }
    }
});

const Feedback = () => {
    const [state, send] = useMachine(feedbackMachine);

    return (
        <div>
            <h1>Feedback Form </h1>
            <pre>
                {JSON.stringify(state, null, 2)}
            </pre>

            {state.matches({'prompt': 'step1'}) ? (
                <div>
                    <p>How was your experience - Step1?</p>
                    <button onClick={() => send({ type: 'GOOD' })}>Great</button>
                    <button onClick={() => send({ type: 'BAD' })}>Bad</button>
                </div>
            ) : null}
            {state.matches({'prompt': 'step2'}) ? (
                <div>
                    <p>How was your experience - Step2?</p>
                    <button onClick={() => send({ type: 'GOOD' })}>Great</button>
                    <button onClick={() => send({ type: 'BAD' })}>Bad</button>
                </div>
            ) : null}
            {state.matches({'prompt': 'step3'}) ? (
                <div>
                    <p>How was your experience - Step3?</p>
                    <button onClick={() => send({ type: 'GOOD' })}>Great</button>
                    <button onClick={() => send({ type: 'BAD' })}>Bad</button>
                </div>
            ) : null}
            {state.matches('error') ? (
                <div>
                    <p>Something went wrong :( </p>
                    <button type="button" onClick={(e) => send({ type: 'RETRY' })}>Retry</button>
                </div>
            ) : null}
            {state.matches('closed') ? (
                <div>
                    <p>Thank you for your feedback!</p>
                    <pre>savedFeedbackSuccess: {state.context.savedFeedbackSuccess}</pre>
                </div>
            ) : null}
            {state.matches('editing') ? (
                <form>
                    <div>
                        <label htmlFor="feedback">Your Feedback:</label>
                        <textarea
                            rows={4}
                            id="feedback"
                            placeholder="Type your mind out!!"
                            value={state.context.feedback}
                            onChange={(e) => {
                                console.log(e.target.value);
                                send({ type: 'CHANGE', value: e.target.value })
                            }}
                            required
                        />
                    </div>
                    {/* <pre>Text: {state.context.feedback}</pre> */}
                    <button type="button" onClick={(e) => send({ type: 'SUBMIT' })} disabled={!state.can({type: 'SUBMIT'})}>Submit</button>
                    <button type="button" onClick={(e) => send({ type: 'BACK' })}>Back</button>
                </form>
            ) : null}
        </div>
    );
};

export default Feedback;