import { type Option, None, Some } from "@/utils/option";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AreaChart, BarChart } from "@tremor/react";
import { timestampParser } from "@/utils/functions";
import { TypographyH4 } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import {
    CHART_COLORS,
    GRK_SIZES,
    PERIOD,
} from "@/utils/constants/shared.constants";
import { useGoldRush } from "@/utils/store";
import { type XYKTokenTimeSeriesProps } from "@/utils/types/molecules.types";
import {
    prettifyCurrency,
    // @ts-ignore
    type PriceTokenTimeseries,
    // @ts-ignore
    type TokenV2VolumeWithChartData,
} from "@covalenthq/client-sdk";
import { capitalizeFirstLetter } from "@/utils/functions/capitalize";

export const XYKTokenTimeSeries: React.FC<XYKTokenTimeSeriesProps> = ({
    chain_name,
    dex_name,
    token_address,
    token_data,
    displayMetrics = "both",
}) => {
    const [maybeResult, setResult] =
        useState<Option<TokenV2VolumeWithChartData>>(None);
    const [chartData, setChartData] =
        useState<Option<{ [key: string]: string | number | Date }[]>>(None);
    const [period, setPeriod] = useState<PERIOD>(PERIOD.DAYS_7);
    const [timeSeries, setTimeSeries] = useState<string>(
        displayMetrics !== "both" ? displayMetrics : "liquidity"
    );
    const { covalentClient } = useGoldRush();

    useEffect(() => {
        maybeResult.match({
            None: () => null,
            Some: (response) => {
                const chart_key = `${timeSeries}_timeseries_${period}d`;
                const value_key =
                    timeSeries === "price"
                        ? "price_of_token0_in_token1"
                        : `${timeSeries}_quote`;

                const result = (
                    response[
                        chart_key as keyof typeof response
                    ] as TokenV2VolumeWithChartData["price_timeseries_7d"]
                    // @ts-ignore
                ).map((x) => {
                    const dt = timestampParser(x.dt, "DD MMM YY");
                    return {
                        date: dt,
                        [`${capitalizeFirstLetter(timeSeries)} (USD)`]:
                            x[value_key as keyof PriceTokenTimeseries],
                    };
                });
                setChartData(new Some(result));
            },
        });
    }, [maybeResult, period, timeSeries, displayMetrics]);

    useEffect(() => {
        if (token_data) {
            setResult(new Some(token_data));
            return;
        }
        (async () => {
            setResult(None);
            // @ts-ignore
            const response = await covalentClient.XykService.getLpTokenView(
                chain_name,
                dex_name,
                token_address
            );
            setResult(new Some(response.data.items[0]));
        })();
    }, [token_data, dex_name, token_address, chain_name, displayMetrics]);

    useEffect(() => {
        if (displayMetrics === "both") return;
        setTimeSeries(displayMetrics);
    }, [displayMetrics]);

    const body = chartData.match({
        None: () => {
            return (
                <div className="mt-8">
                    <Skeleton size={GRK_SIZES.LARGE} />
                </div>
            );
        },
        Some: (result) => {
            if (timeSeries === "liquidity") {
                return (
                    <AreaChart
                        className="mt-2 p-2"
                        data={result}
                        index="date"
                        valueFormatter={prettifyCurrency}
                        yAxisWidth={100}
                        categories={[
                            `${capitalizeFirstLetter(timeSeries)} (USD)`,
                        ]}
                        colors={CHART_COLORS}
                    />
                );
            }
            return (
                <div>
                    <BarChart
                        className="mt-2 p-2"
                        data={result}
                        index="date"
                        valueFormatter={prettifyCurrency}
                        yAxisWidth={100}
                        categories={[
                            `${capitalizeFirstLetter(timeSeries)} (USD)`,
                        ]}
                        colors={CHART_COLORS}
                    />
                </div>
            );
        },
    });

    return (
        <div className="min-h-[20rem] w-full rounded border p-4">
            <div className="pb-4">
                <TypographyH4>{`${capitalizeFirstLetter(
                    timeSeries === "liquidity" ? "Trade Volume" : timeSeries
                )} (USD)`}</TypographyH4>
            </div>

            <div className="flex justify-between">
                {displayMetrics === "both" && (
                    <div className="flex gap-2">
                        <Button
                            disabled={!maybeResult.isDefined}
                            // @ts-ignore
                            variant={
                                timeSeries === "liquidity"
                                    ? "primary"
                                    : "outline"
                            }
                            onClick={() => setTimeSeries("liquidity")}
                        >
                            Amount
                        </Button>
                        <Button
                            disabled={!maybeResult.isDefined}
                            // @ts-ignore
                            variant={
                                timeSeries === "volume" ? "primary" : "outline"
                            }
                            onClick={() => setTimeSeries("volume")}
                        >
                            Volume
                        </Button>
                    </div>
                )}
                <div className="flex gap-2">
                    <Button
                        disabled={!maybeResult.isDefined}
                        // @ts-ignore
                        variant={
                            period === PERIOD.DAYS_7 ? "primary" : "outline"
                        }
                        onClick={() => setPeriod(PERIOD.DAYS_7)}
                    >
                        7 days
                    </Button>
                    <Button
                        disabled={!maybeResult.isDefined}
                        // @ts-ignore
                        variant={
                            period === PERIOD.DAYS_30 ? "primary" : "outline"
                        }
                        onClick={() => setPeriod(PERIOD.DAYS_30)}
                    >
                        30 days
                    </Button>
                </div>
            </div>

            {body}
        </div>
    );
};
