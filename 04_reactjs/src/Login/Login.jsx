import React, { useState, useEffect } from 'react';
import { UserCircle, Lock, Mail, Shield, Check, X } from 'lucide-react';
import { useNavigate, Link } from "react-router-dom";

export default function BiometricLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [chipProgress, setChipProgress] = useState(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState(null); // 'success' or 'error'
  const [particles, setParticles] = useState([]);
  const [scanLine, setScanLine] = useState(0);

  // Update chip progress based on form completion
  useEffect(() => {
    const emailFilled = form.email.length > 0 ? 50 : 0;
    const passwordFilled = form.password.length > 0 ? 50 : 0;
    setChipProgress(emailFilled + passwordFilled);
  }, [form]);

  // Scan line animation
  useEffect(() => {
    if (chipProgress > 0 && !isAuthenticating) {
      const interval = setInterval(() => {
        setScanLine(prev => (prev + 2) % 100);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [chipProgress, isAuthenticating]);

  // Generate floating particles
  useEffect(() => {
    if (chipProgress > 0) {
      const interval = setInterval(() => {
        setParticles(prev => {
          const newParticles = [...prev, {
            id: Date.now(),
            x: Math.random() * 100,
            y: 100,
            delay: Math.random() * 3
          }].slice(-80);
          return newParticles;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [chipProgress]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthStatus(null);

    try {
      // 1. API Request
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || "Invalid credentials");
      }

      const data = await res.json();

      // 2. Save token
      localStorage.setItem('token', data.token);
      
      console.log("Token saved to localStorage",data.token);

      // 3. Success UI + Navigate
      setAuthStatus("success");
      setIsAuthenticating(false);


     //prevents back button 

      setTimeout(() => {
       window.location.replace("/dashboard");
      }, 150);




    } catch (err) {
      // 4. Failure UI
      setAuthStatus("error");
      setIsAuthenticating(false);

      setTimeout(() => {
        setAuthStatus(null);
        setForm({ email: "", password: "" });
      }, 200);
    }
  };


  const getChipColor = () => {
    if (authStatus === 'success') return '#10b981';
    if (authStatus === 'error') return '#ef4444';
    return `rgba(59, 130, 246, ${chipProgress / 100})`;
  };

  const getGlowColor = () => {
    if (authStatus === 'success') return '0 0 30px rgba(16, 185, 129, 0.8)';
    if (authStatus === 'error') return '0 0 30px rgba(239, 68, 68, 0.8)';
    if (chipProgress > 0) return '0 0 20px rgba(59, 130, 246, 0.6)';
    return 'none';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background animated grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        opacity: 0.3
      }} />

      <div style={{
        display: 'flex',
        gap: '60px',
        alignItems: 'center',
        maxWidth: '1200px',
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Biometric Chip Visualization */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative'
        }}>
          {/* Floating particles */}
          {particles.map(particle => (
            <div
              key={particle.id}
              style={{
                position: 'absolute',
                left: `${particle.x}%`,
                bottom: `${particle.y}%`,
                width: '4px',
                height: '4px',
                background: getChipColor(),
                borderRadius: '50%',
                animation: `float 3s ease-in-out forwards`,
                animationDelay: `${particle.delay}s`,
                opacity: chipProgress / 100
              }}
            />
          ))}

          <div style={{
            position: 'relative',
            width: '300px',
            height: '300px'
          }}>
            {/* Outer rotating ring */}
            <div style={{
              position: 'absolute',
              inset: '-20px',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '50%',
              animation: isAuthenticating ? 'spin 2s linear infinite' : 'none'
            }} />

            {/* Main chip container */}
            <div style={{
              width: '100%',
              height: '100%',
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '50%',
              border: `3px solid ${getChipColor()}`,
              boxShadow: getGlowColor(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}>
              {/* Progress fill */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${chipProgress}%`,
                background: `linear-gradient(180deg, transparent, ${getChipColor()})`,
                transition: 'height 0.5s ease, background 0.3s ease',
                opacity: 0.3
              }} />

              {/* Scan line */}
              {chipProgress > 0 && !authStatus && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${scanLine}%`,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${getChipColor()}, transparent)`,
                  boxShadow: `0 0 10px ${getChipColor()}`,
                  transition: 'top 0.03s linear'
                }} />
              )}

              {/* Circuit pattern */}
              <svg width="200" height="200" style={{ position: 'absolute', opacity: chipProgress > 0 ? 0.4 : 0.2, transition: 'opacity 0.5s' }}>
                <circle cx="100" cy="100" r="80" fill="none" stroke={getChipColor()} strokeWidth="1" opacity="0.3" />
                <circle cx="100" cy="100" r="60" fill="none" stroke={getChipColor()} strokeWidth="1" opacity="0.3" />
                <circle cx="100" cy="100" r="40" fill="none" stroke={getChipColor()} strokeWidth="1" opacity="0.3" />
                <line x1="100" y1="20" x2="100" y2="40" stroke={getChipColor()} strokeWidth="2" />
                <line x1="100" y1="160" x2="100" y2="180" stroke={getChipColor()} strokeWidth="2" />
                <line x1="20" y1="100" x2="40" y2="100" stroke={getChipColor()} strokeWidth="2" />
                <line x1="160" y1="100" x2="180" y2="100" stroke={getChipColor()} strokeWidth="2" />
                <line x1="40" y1="40" x2="55" y2="55" stroke={getChipColor()} strokeWidth="2" />
                <line x1="160" y1="160" x2="145" y2="145" stroke={getChipColor()} strokeWidth="2" />
                <line x1="40" y1="160" x2="55" y2="145" stroke={getChipColor()} strokeWidth="2" />
                <line x1="160" y1="40" x2="145" y2="55" stroke={getChipColor()} strokeWidth="2" />
              </svg>

              {/* Center icon */}
              <div style={{
                width: '80px',
                height: '80px',
                background: `radial-gradient(circle, ${getChipColor()}, transparent)`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 2,
                animation: isAuthenticating ? 'pulse 1s ease-in-out infinite' : 'none'
              }}>
                {authStatus === 'success' ? (
                  <Check size={40} color="#10b981" strokeWidth={3} />
                ) : authStatus === 'error' ? (
                  <X size={40} color="#ef4444" strokeWidth={3} />
                ) : (
                  <Shield size={40} color={getChipColor()} />
                )}
              </div>

              {/* Ripple effect when authenticating */}
              {isAuthenticating && (
                <>
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    border: `2px solid ${getChipColor()}`,
                    borderRadius: '50%',
                    animation: 'ripple 1.5s ease-out infinite'
                  }} />
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    border: `2px solid ${getChipColor()}`,
                    borderRadius: '50%',
                    animation: 'ripple 1.5s ease-out infinite 0.5s'
                  }} />
                </>
              )}
            </div>

            {/* Progress percentage */}
            <div style={{
              position: 'absolute',
              bottom: '-50px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: getChipColor(),
              fontSize: '24px',
              fontWeight: 'bold',
              textShadow: `0 0 10px ${getChipColor()}`
            }}>
              {isAuthenticating ? 'Authenticating...' : `${chipProgress}%`}
            </div>
          </div>

          {/* Status message */}
          {authStatus && (
            <div style={{
              marginTop: '80px',
              padding: '15px 30px',
              background: authStatus === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${authStatus === 'success' ? '#10b981' : '#ef4444'}`,
              borderRadius: '10px',
              color: authStatus === 'success' ? '#10b981' : '#ef4444',
              fontWeight: '600',
              animation: 'fadeIn 0.3s ease'
            }}>
              {authStatus === 'success' ? '✓ Authentication Successful' : '✗ Invalid Credentials'}
            </div>
          )}
        </div>

        {/* Login Form */}
        <div style={{
          flex: 1,
          maxWidth: '450px'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(10px)',
            padding: '50px 40px',
            borderRadius: '20px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '30px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield size={28} color="white" />
              </div>
              <div>
                <h2 style={{
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  Secure Login
                </h2>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '14px',
                  margin: '5px 0 0 0'
                }}>
                  Biometric authentication enabled
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '14px',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} style={{
                    position: 'absolute',
                    left: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: form.email ? '#3b82f6' : 'rgba(255, 255, 255, 0.4)',
                    transition: 'color 0.3s'
                  }} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                    disabled={isAuthenticating}
                    style={{
                      width: '100%',
                      padding: '15px 15px 15px 50px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: `2px solid ${form.email ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)'}`,
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '14px',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} style={{
                    position: 'absolute',
                    left: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: form.password ? '#3b82f6' : 'rgba(255, 255, 255, 0.4)',
                    transition: 'color 0.3s'
                  }} />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                    disabled={isAuthenticating}
                    style={{
                      width: '100%',
                      padding: '15px 15px 15px 50px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: `2px solid ${form.password ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)'}`,
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuthenticating || chipProgress < 100}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: chipProgress === 100 
                    ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' 
                    : 'rgba(59, 130, 246, 0.3)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: chipProgress === 100 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s',
                  boxShadow: chipProgress === 100 ? '0 10px 30px rgba(59, 130, 246, 0.4)' : 'none',
                  opacity: isAuthenticating ? 0.7 : 1,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isAuthenticating ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    Authenticating...
                  </span>
                ) : (
                  'LOGIN'
                )}
              </button>

              <p style={{
                textAlign: 'center',
                marginTop: '25px',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '14px'
              }}>
                Don't have an account?{' '}
                <a href="/register" style={{
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Sign up
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          
          @keyframes ripple {
            0% { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
          }
          
          @keyframes float {
            0% { transform: translateY(0) scale(0); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateY(-300px) scale(1); opacity: 0; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}