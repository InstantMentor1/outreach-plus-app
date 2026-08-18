'use client';
import { FormEvent, useState } from 'react';
export default function WaitlistForm(){const [message,setMessage]=useState('');function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setMessage('You’re on the list. We’ll be in touch soon.');e.currentTarget.reset();}return <form className="waitlist" onSubmit={submit}><input aria-label="Email address" type="email" placeholder="Your email address" required/><button className="button" type="submit">Join waitlist <span>→</span></button>{message&&<small role="status">{message}</small>}</form>}
