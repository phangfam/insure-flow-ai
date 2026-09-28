export default function PendingPage() {
  return (
    <html>
      <body style={{margin:0, fontFamily:'sans-serif', background:'#f9fafb'}}>
        <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{background:'white', borderRadius:'12px', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', padding:'48px', maxWidth:'440px', width:'100%', textAlign:'center'}}>
            <div style={{fontSize:'56px', marginBottom:'16px'}}>⏳</div>
            <h1 style={{fontSize:'24px', fontWeight:'700', color:'#111', marginBottom:'8px'}}>Account Pending Approval</h1>
            <p style={{color:'#6b7280', lineHeight:'1.6', marginBottom:'24px'}}>
              Your account has been created. Please wait for your agency admin to approve your access. You will be able to log in once approved.
            </p>
            <a href="/login" style={{color:'#2563eb', fontSize:'14px'}}>Back to login</a>
          </div>
        </div>
      </body>
    </html>
  )
}