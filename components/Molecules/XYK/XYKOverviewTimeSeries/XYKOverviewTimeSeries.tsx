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
import { type XYKOverviewTimeSeriesProps } from "@/utils/types/molecules.types";
import {
    type LiquidityEcosystemChart,
    type UniswapLikeEcosystemCharts,
} from "@/utils/types/XykServiceTypes";
import { capitalizeFirstLetter } from "@/utils/functions/capitalize";

import { ecosystemChartDatas } from '@/graphql/overview';
import { prettifyCurrencys } from '@/graphql/util';


let currencys: string = '';
export const XYKOverviewTimeSeries: React.FC<XYKOverviewTimeSeriesProps> = ({
    chain_name,
    dex_name,
    overview_data,
    displayMetrics = "both",
    value_good_id, chain_id
}) => {
    const [maybeResult, setResult] =
        useState<Option<UniswapLikeEcosystemCharts>>(None);
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

                currencys = response.quote_currency;

                const chart_key = `${timeSeries}_chart_${period}d`;
                const value_key =
                    timeSeries === "price"
                        ? "price"
                        : `${timeSeries}_quote`;
                const result = (
                    response[
                    chart_key as keyof typeof response
                    // @ts-ignore
                    ] as UniswapLikeEcosystemCharts["liquidity_chart_7d"]
                    // @ts-ignore
                ).map((x) => {
                    const dt = timestampParser(x.dt, "DD MMM YY");
                    return {
                        // currency: x.quote_currency,
                        date: dt,
                        [`${capitalizeFirstLetter(timeSeries)} (${x.quote_currency})`]:
                            x[value_key as keyof LiquidityEcosystemChart],
                    };
                });
                setChartData(new Some(result));
                // console.log(chart_key,value_key,0,`${capitalizeFirstLetter(timeSeries)} (USD)`,"****",currencys)
            },
        });
    }, [maybeResult, period, timeSeries, displayMetrics]);

    useEffect(() => {
        if (overview_data) {
            setResult(new Some(overview_data));
            return;
        }
        (async () => {
            setResult(None);
            const response =

                await ecosystemChartDatas(value_good_id, chain_id);

            // @ts-ignore
            setResult(new Some(response));
        })();
    }, [overview_data, dex_name, chain_name, displayMetrics, value_good_id]);

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
            // console.log(result,"###**")
            if (timeSeries === "liquidity") {
                return (
                    <AreaChart
                        className="mt-2 p-2"
                        data={result}
                        index="date"
                        valueFormatter={prettifyCurrencys}
                        yAxisWidth={100}
                        categories={[
                            `${capitalizeFirstLetter(timeSeries)} (${currencys})`,
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
                        valueFormatter={prettifyCurrencys}
                        yAxisWidth={100}
                        categories={[
                            `${capitalizeFirstLetter(timeSeries)} (${currencys})`,
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
                    timeSeries === "liquidity" ? "investment" : timeSeries
                )} (${currencys})`}</TypographyH4>
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
                            Liquidity
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
