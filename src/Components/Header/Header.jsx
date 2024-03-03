import React from "react";
import { ReactComponent as TotalIcon } from "../../media/total.svg";
import { ReactComponent as TickIcon } from "../../media/tick.svg";
import { useSelector } from "react-redux";
import Circle from 'react-circle';


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
            <div id="text">Failed Tests</div>
            <div id="num">{counter?.failed}</div>
          </div>
        </div>
        <Circle
          progress={counter?.rate}
          animate={true}
          progressColor={counter?.rate <= 50 ? "rgb(178,34,34)" : "rgb(0,100,0)"}
          textColor="#ffff"
          />
        <div>

        </div>
      </div>
    </header>
  );
};
