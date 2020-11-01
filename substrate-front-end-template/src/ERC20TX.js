import React, { useState } from 'react';
import { Button, Form, Input, Grid } from 'semantic-ui-react';
import { Abi, ContractPromise } from '@polkadot/api-contract';
import { useSubstrate } from './substrate-lib';
import metadata from './contract/metadata.json';

export default function Main (props) {
  const [status, setStatus] = useState(null);
  const [balVal, setBalVal] = useState(null);
  const [formState, setFormState] = useState({ addressTo: null, amount: 0 });
  const { accountPair } = props;
  const CONTRACT_ADDRESS = '5EgP4qB1ZNg9gnf2bJjp4KtHPTZBNrjqQswLNzHeCR7VANeS';

  const onChange = (_, data) =>
    setFormState(prev => ({ ...prev, [data.state]: data.value }));

  const { addressTo, amount } = formState;

  const { api } = useSubstrate();
  const contract = new ContractPromise(api, new Abi(metadata), CONTRACT_ADDRESS);
  const gasLimit = 300000n * 1000000n;
  
  const setBalance = () => {
    contract.query.balanceOf(addressTo, 0, gasLimit, addressTo).then((balance) => {
      setBalVal(`Balance: ${balance.output.toNumber()}`);
    });
  };

  const transfer = () => {
    contract.tx.transfer(0, gasLimit, addressTo, amount)
      .signAndSend(accountPair, (result) => {
        if (result.status.isInBlock) {
          setStatus(`Current transaction status: ${result.status.type}`);
        } else if (result.status.isFinalized) {
          setStatus(`😉 Finalized. Block hash: ${result.status.asFinalized.toString()}`);
        }
      });
  };

  return (
    <Grid.Row>
      <Grid.Column width={8}>
        <h1>ERC20 Token Transfer</h1>
        <Form>
          <Form.Field>
            <Input
              fluid
              label='To'
              type='text'
              placeholder='address'
              state='addressTo'
              onChange={onChange}
            />
          </Form.Field>
          <Form.Field>
            <Input
              fluid
              label='Amount'
              type='number'
              state='amount'
              onChange={onChange}
            />
          </Form.Field>
          <Form.Field style={{ textAlign: 'center' }}>
            <Button onClick={transfer}>Transfer</Button>
          </Form.Field>
          <div style={{ overflowWrap: 'break-word' }}>{status}</div>
        </Form>
      </Grid.Column>
      <Grid.Column width={8}>
        <h1>ERC20 Token Balance</h1>
        <Form>
          <Form.Field>
            <Input
              fluid
              label='To'
              type='text'
              placeholder='address'
              state='addressTo'
              onChange={onChange}
            />
          </Form.Field>
          <Form.Field style={{ textAlign: 'center' }}>
            <Button onClick={setBalance}>Balance</Button>
          </Form.Field>
          <div style={{ overflowWrap: 'break-word' }}>{balVal}</div>
        </Form>
      </Grid.Column>
    </Grid.Row>
  );
}
