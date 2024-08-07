import { type Meta, type StoryObj } from "@storybook/react";
import { DecodedTransaction as DecodedTransactionComponent } from "./DecodedTransaction";
import { TypographyH1 } from "@/components/ui/typography";

type Story = StoryObj<typeof DecodedTransactionComponent>;

const meta: Meta<typeof DecodedTransactionComponent> = {
    title: "Molecules",
    component: DecodedTransactionComponent,
    argTypes: {
        setTxMetadata: {
            control: false,
            table: {
                disable: true,
            },
        },
    },
    // @ts-ignore
    render: ({ chain_name, tx_hash, setTxMetadata }) => (
        <section>
            <div className="mb-8">
                <TypographyH1>Decoded Transaction</TypographyH1>
            </div>

            <DecodedTransactionComponent
                chain_name={chain_name}
                tx_hash={tx_hash}
                setTxMetadata={setTxMetadata}
            />
        </section>
    ),
};

export default meta;

export const DecodedTransaction: Story = {
    args: {
        chain_name: "eth-mainnet",
        tx_hash:
            "0x7a038d2f5be4d196a3ff389497f8d61a639e4a32d353758b4f062cafbc5d475c",
    },
};
