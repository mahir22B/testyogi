import React from "react";
import { ReactComponent as TotalIcon } from "../../media/total.svg";
import { ReactComponent as TickIcon } from "../../media/tick.svg";
import { useSelector } from "react-redux";

export const Header = () => {
  const counter = useSelector((state) => state?.counter);
  return (
    <header className="main-header">
      <div className="counter-main">
        <div className="counter-cards-1">
          <TotalIcon width={25} height={25} />
          <div className="counter-text">
            <div id="text">Passed Tests</div>
            <div id="num">{counter?.value}</div>
          </div>
        </div>
        <div className="counter-cards-2">
          <TickIcon width={25} height={25} />
          <div className="counter-text">
            <div id="text">Current Pass Rate</div>
            <div id="num">{counter?.rate}%</div>
          </div>
        </div>
      </div>
    </header>
  );
};
