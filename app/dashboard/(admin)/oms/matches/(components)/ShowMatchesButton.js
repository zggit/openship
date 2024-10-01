import React from "react";
import { useQuery, gql } from "@apollo/client";
import { Button } from "@ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@keystone/themes/Tailwind/atlas/primitives/default/ui/sheet";
import { MatchCard } from "./MatchCard";
import { Badge } from "@keystone/themes/Tailwind/atlas/primitives/default/ui/badge";
import { Card } from "@keystone/themes/Tailwind/atlas/primitives/default/ui/card";

const GET_MATCHES_COUNT = gql`
  query GetMatchesCount($where: MatchWhereInput!) {
    matchesCount(where: $where)
  }
`;

const GET_MATCHES = gql`
  query GetMatches($where: MatchWhereInput!) {
    matches(where: $where) {
      id
      input {
        id
        quantity
        productId
        variantId
        externalDetails {
          title
          image
          price
          inventory
        }
        shop {
          id
          name
        }
      }
      output {
        id
        quantity
        productId
        variantId
        externalDetails {
          title
          image
          price
          inventory
        }
        channel {
          id
          name
        }
        priceChanged
      }
      outputPriceChanged
      inventoryNeedsToBeSynced {
        syncEligible
        sourceQuantity
        targetQuantity
      }
    }
  }
`;

export const ShowMatchesButton = ({ product, onMatchAction }) => {
  const whereClause = {
    AND: [
      {
        input: {
          some: {
            productId: { equals: product.productId },
            variantId: { equals: product.variantId },
          },
        },
      },
    ],
  };

  const { data: countData, loading: countLoading } = useQuery(
    GET_MATCHES_COUNT,
    {
      variables: { where: whereClause },
    }
  );

  const {
    data: matchesData,
    loading: matchesLoading,
    refetch,
  } = useQuery(GET_MATCHES, {
    variables: { where: whereClause },
  });

  const handleSheetOpen = () => {
    refetch();
  };

  return (
    <Sheet onOpenChange={handleSheetOpen}>
      <SheetTrigger asChild>
        <Button
          className="mt-auto cursor-pointer text-xs border font-medium uppercase tracking-wide py-1 px-1.5"
          variant="secondary"
          isLoading={countLoading}
        >
          Show Matches
          {!countLoading && countData && (
            <Badge className="border py-0.5 px-1.5 text-xs ml-2">
              {countData.matchesCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Item Matches</SheetTitle>
          <Card className="p-2 bg-muted/40">
            <div className="flex space-x-2">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.title}
                  className="border w-16 h-16 object-cover rounded-md"
                />
              )}
              <div className="flex-grow">
                <div className="text-sm font-medium">{product.title}</div>
                <div className="text-xs text-gray-500">
                  {product.productId} | {product.variantId}
                </div>
                <div className="text-sm font-medium">${product.price}</div>
              </div>
            </div>
          </Card>
        </SheetHeader>
        <div className="text-muted-foreground px-6 py-2 font-medium uppercase tracking-wider text-sm">
          {matchesData?.matches?.length} match
          {matchesData?.matches?.length > 1 ? "es" : ""} found
        </div>
        <div className="border-y space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          {matchesLoading ? (
            <div>Loading matches...</div>
          ) : matchesData?.matches?.length > 0 ? (
            matchesData.matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onMatchAction={onMatchAction}
              />
            ))
          ) : (
            <>No Matches Found</>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};