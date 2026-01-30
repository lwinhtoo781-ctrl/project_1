import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const linkStyle = ({ isActive }) => ({
    marginRight: 12,
    fontWeight: isActive ? 700 : 400,
    textDecoration: "none",
  });

  return (
    <div style={{ padding: 12, borderBottom: "1px solid #ddd" }}>
      <Link to="/" style={{ marginRight: 16, fontWeight: 800, textDecoration: "none" }}>
        Sales App
      </Link>

      <NavLink to="/" style={linkStyle}>Dashboard</NavLink>
      <NavLink to="/journal" style={linkStyle}>Sales Journal</NavLink>
    </div>
  );
}
