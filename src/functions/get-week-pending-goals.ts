import dayjs from "dayjs";
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { db } from "../db"
import {and, count, lte,gte,eq,sql} from "drizzle-orm";
import { goalCompletions, goals } from "../db/schema"

dayjs.extend(weekOfYear);

export async function getWeekPendingGoals() {
    const firtsDayOfWeek = dayjs().startOf('week').toDate();
    const lastDayOfWeek = dayjs().endOf('week').toDate();

    const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
        db.select({
           id: goals.id,
           title: goals.title,
           desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
           createdAt: goals.createdAt 
        }).from(goals)
        .where(lte(goals.createdAt, lastDayOfWeek))
    )

    const goalCompletionCounts = db.$with('goal_completion_counts').as(
        db.select({
            goalId: goalCompletions.goalId,
            completionCount: count(goalCompletions.id).as('completionCount'),
        }).from(goalCompletions)
        .where(and(
            gte(goalCompletions.createdAt, firtsDayOfWeek),
            lte(goalCompletions.createdAt, lastDayOfWeek)
        ))
        .groupBy(goalCompletions.goalId)
    )

     try {
        const pedingGoals = await db
    .with(goalsCreatedUpToWeek,goalCompletionCounts)
    .select({
        id:goalsCreatedUpToWeek.id,
        title: goalsCreatedUpToWeek.title,
        desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
        goalCompletionCounts:sql`COALESCE(${goalCompletionCounts.completionCount,0})`.mapWith(Number),

    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goalsCreatedUpToWeek.id))
    return pedingGoals
    
    } catch (error) {
        console.log(error)
    }

   
}
