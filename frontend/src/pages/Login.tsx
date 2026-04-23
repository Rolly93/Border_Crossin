import React, { useState, type ChangeEvent, type FormEvent } from "react";
import '../App.css';
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api"; 

export default function LogingPage() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const handelChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setUserData({
            ...userData,
            [id]: value
        });
    };

    const handelSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(""); 

        try {
            
            const data = await authService.login(userData);
            console.log(data)
            if (data.status =="success") { 
                const userobj = {id: data.user_id , isAdmin:data.is_admin}
                localStorage.setItem('user_session',JSON.stringify(userobj))
                localStorage.setItem("token", data.token);
                navigate(`/dashboard/${userobj.id}`);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container"> 
            <div className="background">
                <div className="shape"></div>
                <div className="shape"></div>
            </div>
            
            <form onSubmit={handelSubmit}>
                <h3>Login Here</h3>

                {/* Show error message if it exists */}
                {error && <p style={{ color: '#f8b8ad', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

                <label htmlFor="email">Email</label>
                <input 
                    type="text" 
                    placeholder="admin@test.com" 
                    id="email"
                    value={userData.email}
                    onChange={handelChange}
                    required
                />

                <label htmlFor="password">Password</label>
                <input 
                    type="password" 
                    placeholder="1234" 
                    id="password"
                    value={userData.password}
                    onChange={handelChange}
                    required
                />

                <button type="submit">Log In</button>
            </form>
        </div>
    );
}