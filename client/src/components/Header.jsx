import {
    Bell,
    Search
} from "lucide-react";

function Header() {

    return (
        <header className="topbar">

            <div className="search-box">

                <Search
                    size={18}
                    strokeWidth={1.8}
                />

                <input
                    type="text"
                    placeholder="Search inventory..."
                />

                <span className="search-shortcut">
                    /
                </span>

            </div>


            <div className="topbar-right">

                <div className="system-status">

                    <span className="status-dot"></span>

                    System Online

                </div>


                <button className="icon-button">

                    <Bell
                        size={19}
                        strokeWidth={1.8}
                    />

                    <span className="notification-dot"></span>

                </button>


                <div className="profile">

                    <div className="profile-avatar">
                        A
                    </div>

                </div>

            </div>

        </header>
    );
}

export default Header;