import { backdropClasses } from '@mui/material';
import React from 'react';

function LandingPage()  {
  return (
    <div style={styles.main}>
      <h1>Welcome to BudgetWise</h1>
      <h2>Save More. Live Better.</h2>
      <button style={styles.button}>Sign Up</button>
    </div>
  );
};

const styles = {
    main : {

    },
    button: {
        color: 'white',
        backgroundColor: '#04CA04',
    },

}
export default LandingPage;